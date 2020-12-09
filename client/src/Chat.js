import React from "react";
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { messagesQuery, addMessageMutation, msgAddedSubscription } from './graphql/queries'
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
// onCompleted in useQuery when query is complete
//onSubscriptionData in useSubscription when subcription is made (here response still null) and when subscription receives new data


const useChatMsg = () => {

  const { data } = useQuery(messagesQuery)
  const messages = data ? data.messages : []

  useSubscription(msgAddedSubscription, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      client.writeData({
        data: {
          messages: messages.concat(subscriptionData.data.messageAdded)//make sure data has same structure 
          //as the query used to retrieve that data
        }
      })
    }
  })
  //What useQuery does behind the seen for us
  //const [res, setRes] =useState({loading:false})
  // React.useEffect(()=>{
  //client.query({query:messagesQuery}).then(({data})=>setResult({loading:false,data}))
  //  })

  const [addMessage] = useMutation(addMessageMutation)//useMutation is not executed instantly like 
  //useQuery but returns a tuple with first value as the fxn to call for the mutation in this case 'addMessage'

  return {
    messages,
    addMessage
  }
}


const Chat = ({ user }) => {


  const { messages, addMessage } = useChatMsg()


  const handleSend = async (text) => {
    await addMessage({
      variables: {
        input: { text }
      }
    });
  }
  //if (loading) return <h1>loading...</h1>
  //if (error) return <h1>Error Occured!...</h1>
  return (
    <section className='section'>
      <div className='container'>
        <h1 className='title'>Chatting as {user}</h1>
        <MessageList user={user} messages={messages} />
        <MessageInput onSend={handleSend.bind(this)} />
      </div>
    </section>
  )
}

export default Chat;





//Naive

// const Chat =({user})=>{
//   const [messages,setMessages]=React.useState([])
//     useQuery(messagesQuery,{
//       onCompleted:({messages})=>{
//         setMessages(messages)
//       }
//     })
//   useSubscription(msgAddedSubscription,{
//     onSubscriptionData:({subscriptionData})=>{
//       setMessages(messages.concat(subscriptionData.data.messageAdded))
//     }
//   })


//   const [addMessage] = useMutation(addMessageMutation)//useMutation is not executed instantly like 

// const handleSend=async (text)=>{
//   const {data} = await addMessage({ 
//     variables: { 
//       input: { text } 
//     }
//   });
// }


//   return(
//     <section className='section'>
//           <div className='container'>
//             <h1 className='title'>Chatting as {user}</h1>
//             <MessageList user={user} messages={messages} />
//             <MessageInput onSend={handleSend.bind(this)} />
//           </div>
//         </section>
//   )
// }

// export default Chat;
