import gql from "graphql-tag";
import client from "./client";


const messageResponseFragment = gql`
  fragment msgDetail on Message {
    id
    from
    text
  }
`;

export const messagesQuery = gql`
  query MessagesQuery {
    messages {
     ...msgDetail
    }
  }
  ${messageResponseFragment}
`;

export const addMessageMutation = gql`
  mutation AddMessageMutation($input: MessageInput!) {
    message: addMessage(input: $input) {
      ...msgDetail
    }
  }
  ${messageResponseFragment}
`;

export const msgAddedSubscription = gql`
  subscription {
    messageAdded {
      ...msgDetail
    }
  }
  ${messageResponseFragment}
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
