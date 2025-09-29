import React from "react";
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext,useState,useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import ErrorBoundary from "./ErrorBoundary"; 

function ChatWindow() {
  const { prompt, setPrompt, reply, setReply ,currThreadId,setPrevChats,setNewChat} = useContext(MyContext);
   const [loading,setLoading] = useState(false);
   const [isOpen,setIsOpen] = useState(false);
   const [isToggle,setIsToggle] = useState(false);

  const getReply = async()=>{
    setLoading(true);
    setNewChat(false);
    console.log("message",prompt,"threadId",currThreadId);

     const options ={
      method:"POST",
      headers:{
         "Content-Type":"application/json",

      },
      body:JSON.stringify({
        message:prompt,
        threadId:currThreadId,
      })
     };

     try{
         const response = await fetch("http://localhost:3000/api/chat",options);
         const res = await response.json();
         console.log(res);
         setReply(res.reply);
         
     }catch(err){
           console.log(err);
     }
     setLoading(false);
     
  }

  // Append newchat to prevChat
  useEffect(()=>{
    if(prompt && reply ){
        setPrevChats(prevChats =>(
          [...prevChats,{
             role:"user",
             content:prompt,
          },{
              role:"assistant",
              content:reply
          }]
        ))
    }
     setPrompt(""); 
  },[reply]);
  
  const handleProfileClick=()=>{
     setIsOpen(!isOpen);
  }

  const handleToggleClick=()=>{
    setIsToggle(!isToggle);
  }
  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          MYGPT<i className="fa-solid fa-angle-down"></i>
        </span>
        <div className="userIcon">
          <span className="usericonDiv" onClick={handleProfileClick}>
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>
      {
         isOpen && 
          <div className="dropDown">
            <div className="dropDownItem"><i className="fa-solid fa-gear"></i>Setting</div>
            <div className="dropDownItem"><i class="fa-solid fa-cloud-arrow-up"></i>Upgrade Plan</div>
            <div className="dropDownItem" onClick={handleToggleClick}>
                <i className={`fa-solid ${isToggle ? "fa-toggle-on" : "fa-toggle-off"} toggleIcon`}></i>
              <span className="themeLabel">Theme</span>
            </div>


            <div className="dropDownItem"><i class="fa-solid fa-right-from-bracket"></i>Logout</div>
          </div>
      }

      <ErrorBoundary>
        <Chat/>
      </ErrorBoundary>
      

       <ScaleLoader color="#fff" loading={loading}>

       </ScaleLoader>
      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e)=> e.key ==='Enter'? getReply():''}
          />
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="info">
          MYGPT CAN MAKE MISTAKES .CHECK IMPORTANT INFO.SEE COOKIES
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
