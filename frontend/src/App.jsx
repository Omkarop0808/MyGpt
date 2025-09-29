import React from 'react';
import './App.css';
import SideBar from './SideBar';
import ChatWindow from './ChatWindow';
import { MyContext } from './MyContext';
import { useState } from "react";
import { v1 as uuidv1 } from 'uuid';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import MockInterview from './MockInterview'; // don't forget this import!
import Analysis from './Analysis';

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads
  };

  return (
    <Router>
      <div className='app'>
        <MyContext.Provider value={providerValues}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <SideBar />
                  <ChatWindow />
                </>
              }
            />
            <Route path="/mockinterview" element={<MockInterview />} />
            <Route path="/analysis" element={<Analysis />} />
          </Routes>
        </MyContext.Provider>
      </div>
    </Router>
  );
}

export default App;
