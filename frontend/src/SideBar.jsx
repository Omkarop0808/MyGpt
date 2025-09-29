import React from 'react'
import "./SideBar.css";
import {MyContext} from "./MyContext.jsx";
import { useContext,useEffect } from 'react';
import {v1 as uuidv1} from "uuid";
import { Link } from 'react-router-dom';
function SideBar() {
  const {allThreads,setAllThreads,currThreadId,setNewChat,setPrompt,setReply,setCurrThreadId,setPrevChats} = useContext(MyContext);

  const getAllThreads =async()=>{
    try{
       const response = await fetch("http://localhost:3000/api/thread");
       const res = await response.json();
       
      //  console.log(res);
      const filterData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));

      //  console.log(filterData);
       setAllThreads(filterData);
      //  store threadId and title

      
    }catch(err){
        console.log(err);
    }

  };

  useEffect(()=>{

      getAllThreads();
  },[currThreadId]);


  const createNewChat = ()=>{
     setNewChat(true);
     setPrompt("");
     setReply(null);
     setCurrThreadId(uuidv1());
     setPrevChats([]);
  }

  const changeThread =async(newThreadId)=>{
    setCurrThreadId(newThreadId);
    try{

       const response = await fetch(`http://localhost:3000/api/thread/${newThreadId}`);
       const res = await response.json();
       console.log(res);
       setPrevChats(res);
       setNewChat(false);
       setReply(null);
    }catch(err){
      console.log(err);

    }
    
    
  }

  const deleteThread = async (threadId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/thread/${threadId}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      console.log("Thread deleted successfully (200 No Content)");


    } 
    // update threads re-render
    setAllThreads(prev => prev.filter(thread => thread.threadId != threadId));
    if(threadId === currThreadId){
      createNewChat();
    }
  } catch (err) {
    console.error("Error deleting thread:", err);
  }
};

  return (
   
      <section className="sidebar">
        {/* new chat button  */}
        <button onClick={createNewChat}>
            <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo" />
            <span><i className="fa-solid fa-pen-to-square"></i></span>

        </button>
        
        {/* mockinterview */}


      <Link to="/mockinterview" style={{ textDecoration: 'none' }} >
       <button className="mockInterview">
         MockInterview &nbsp;   &nbsp;   &nbsp;   &nbsp;  &nbsp;  &nbsp;  &nbsp;
        <img src="src/assets/interview.png" alt="gpt logo" className="logo" />
       </button>
      </Link>


        {/* history */}
        <ul className="history">
            {
             allThreads?.map((thread, idx) => (
                <li key={idx}
                  onClick={()=>changeThread(thread.threadId)}
                  className={thread.threadId === currThreadId ? "highlighted":" "}
                  >
                   
                  {thread.title}
                  <i className="fa-solid fa-trash"
                    onClick={(e)=>{
                      e.stopPropagation();//stop event bubling
                      deleteThread(thread.threadId);
                  }} ></i>

               </li>
            ))
            }
        </ul>
        {/* sign */}
        <div className="sign">
            <p>By  omkar   &hearts;</p>
        </div>
      </section>
    
  )
}

export default SideBar;
