import {useContext,useState,useEffect} from 'react';
import { MyContext } from "./MyContext";
import "./Chat.css";
import ReactMarkdown from "react-markdown"; 
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// For  Formatting
// react-markdown

// rehype-highlight->for syntax highligting

function Chat() {
  const {newChat,prevChats,reply} = useContext(MyContext);
  const [latestReply,setLatestReply] = useState(null);

  useEffect(()=>{
    if(reply === null){
     
        setLatestReply(null);//prev chat load
        return;
    }

    if(!prevChats?.length) return;

     const content = reply.response.split(" ");//individual words
    
     let idx = 0;

     const interval = setInterval(()=>{
         setLatestReply(content.slice(0,idx+1).join(" "));

          idx++;
         if(idx >= content.length) clearInterval(interval)
     },40)
     
    // latestReply seperate => typing effect create
    return ()=>clearInterval(interval);

  },[prevChats,reply])


//   useEffect(() => {
//   console.log("Last chat message:", prevChats[prevChats.length - 1]);
// }, [prevChats]);

  return (
    <>
    {newChat && <h1>Start a New Chat!</h1>}
    <div className="chats">

      {
        prevChats?.slice(0,-1).map((chat,idx)=>(


          <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
            {
              chat.role === "user"?
              <p className="userMessage">{chat.content}</p> :
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
            }
            

          </div>
        )
        )
      }

{/* //ternary way */}
     {/* {
      prevChats.length >0 && (
        <>
        {
          latestReply === null ? (
            <div className="gptDiv" key={"typing"}>
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
        </div>
          ):(
        <div className="gptDiv" key={"non-typing"}>
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{prevChats[prevChats.length-1].content}</ReactMarkdown>
        </div>

      )
      
        }
        </>
      )
     } */}
     {/* or  */}

      {
        prevChats.length > 0 && latestReply !=null && 
        <div className="gptDiv" key={"typing"}>
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
        </div>
      }

{
  prevChats.length > 0 &&
  latestReply === null &&
  prevChats[prevChats.length - 1].role === "assistant" &&
  typeof prevChats[prevChats.length - 1].content === "string" && (
    <div className="gptDiv" key={"non-typing"}>
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
        {prevChats[prevChats.length - 1].content}
      </ReactMarkdown>
    </div>
  )
}

    </div>
    </>

  )
}

export default Chat;

// static data
        // <div className="userDiv">
        //     <p className="userMessage">
        //         USER MESSAGE
        //     </p>
        // </div>
        // <div className="gptDiv">
        //   <p className="gptMessage">
        //     gptMessage
        //   </p>
        // </div>



      // {
      //   prevChats.length > 0 && latestReply !=null && 
      //   <div className="gptDiv" key={"typing"}>
      //     <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
      //   </div>
      // }

      //   {
      //   prevChats.length > 0 && latestReply === null && 
      //   <div className="gptDiv" key={"non-typing"}>
      //     <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{prevChats[prevChats.length-1].content.reply.response}</ReactMarkdown>
      //   </div>
        
      // }