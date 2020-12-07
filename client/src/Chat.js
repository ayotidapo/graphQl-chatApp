import React, { useState } from "react";
import { addMessage, getMessages, onMessageAdded } from "./graphql/queries";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

const Chat =({user})=>{
const [messages,setMessages]=useState([])
React.useEffect(()=>{
  const messages = await getMessages();
},[])

const handleSend=()=>{
   addMessage(text);
}
return(
  <section className='section'>
        <div className='container'>
          <h1 className='title'>Chatting as {user}</h1>
          <MessageList user={user} messages={messages} />
          <MessageInput onSend={handleSend.bind(this)} />
        </div>
      </section>
)
}
  state = { messages: [] };
  subscription = null;

  async componentDidMount() {
    const messages = await getMessages();
    this.setState({ messages });
    this.subscription = onMessageAdded((message) => {

      this.setState({ messages: this.state.messages.concat(message) });
    });
    
  }

  componentWillUnmount() {
    /// this.subscription.unsubscribe();
    if (this.subscription.unsubscribe) {
      this.subscription.unsubscribe();
    }
  }

  async handleSend(text) {
    await addMessage(text);
  }

  render() {
    const { user } = this.props;
    const { messages } = this.state;
    return (
      <section className='section'>
        <div className='container'>
          <h1 className='title'>Chatting as {user}</h1>
          <MessageList user={user} messages={messages} />
          <MessageInput onSend={this.handleSend.bind(this)} />
        </div>
      </section>
    );
  }
}

export default Chat;
