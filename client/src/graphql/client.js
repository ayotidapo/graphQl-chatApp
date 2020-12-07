import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from "apollo-boost";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { getAccessToken } from "../auth";

const httpUrl = "http://localhost:9001/graphql";
const wsUrl = "ws://localhost:9001/graphql";

const authLink = new ApolloLink((operation, forward) => {
  const token = getAccessToken();
  if (token) {
    operation.setContext({ headers: { authorization: `Bearer ${token}` } });
  }
  return forward(operation);
});

const httpLink = ApolloLink.from([authLink, new HttpLink({ uri: httpUrl })]);

const wsLink = new WebSocketLink({
  uri: wsUrl,
  options: {
    connectionParams: () => ({
      //changing connectionParams to fnx instead of object makes it execute it after the graphQl subscription is made
      //so thatgetAccessToken() wont return null when user logs out and logs in again
      accessToken: getAccessToken(),
    }),
    reconnect: true, //if connection disconnect for any reason try to reconnect.
    lazy: true, //setting true starts ws connection only when is needed,ie first time we request a graphQl subscription
    //false is  default and that makes the connection as soon as app is loaded whether we equest a graphQl subscriptiont to ws or not
    //which we dont need cos login is the first page
  },
});

const isItSubscription = (operation) => {
  const definition = getMainDefinition(operation.query);
  return (
    definition.kind === "OperationDefinition" &&
    definition.operation === "subscription"
  );
};

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: split(isItSubscription, wsLink, httpLink), //this handles if the connection is subscription use wsLink otherwise httpLink
  defaultOptions: { query: { fetchPolicy: "no-cache" } },
});

export default client;
