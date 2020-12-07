const db = require("./db");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

function requireAuth(userId) {
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
}

const Query = {
  messages: (_root, _args, { userId }) => {
    requireAuth(userId);
    return db.messages.list();
  },
};

const MESSAGE_ADDED = "MESSAGE_ADDED";

const Mutation = {
  addMessage: (_root, { input }, { userId }) => {
    requireAuth(userId);
    const messageId = db.messages.create({ from: userId, text: input.text });
    const message = db.messages.get(messageId);
    pubsub.publish(MESSAGE_ADDED, { messageAdded: message });// note "messageAdded" must be same name as the subscription name as defined in the schema 
    return db.messages.get(messageId);
  },
};

const Subscription = {
  messageAdded: {
    subscribe: (_root, _args, { userId }) => {
      
      requireAuth(userId);
      return pubsub.asyncIterator(MESSAGE_ADDED);
    },
  },
};

module.exports = { Query, Mutation, Subscription };
