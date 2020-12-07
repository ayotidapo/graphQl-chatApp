import gql from "graphql-tag";
import client from "./client";

const messagesQuery = gql`
  query MessagesQuery {
    messages {
      id
      from
      text
    }
  }
`;

const addMessageMutation = gql`
  mutation AddMessageMutation($input: MessageInput!) {
    message: addMessage(input: $input) {
      id
      from
      text
    }
  }
`;

const msgAddedSubscription = gql`
  subscription {
    messageAdded {
      id
      from
      text
    }
  }
`;

export async function addMessage(text) {
  const { data } = await client.mutate({
    mutation: addMessageMutation,
    variables: { input: { text } },
  });
  return data.message;
}

export async function getMessages() {
  const { data } = await client.query({ query: messagesQuery });
  return data.messages;
}

export async function onMessageAdded(msgHandler) {
  const observable = client.subscribe({ query: msgAddedSubscription }); //subscribe

  return observable.subscribe((result) => msgHandler(result.data.messageAdded)); //listen & run when event happens
  // "result" here is the response data
}
