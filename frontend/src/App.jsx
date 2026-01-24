import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import SideBar from "./SideBar";
import ChatWindow from "./ChatWindow";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import MockInterview from "./MockInterview";
import AuthPage from "./pages/AuthPage";
import Upgrade from "./pages/Upgrade";

const DashboardLayout = () => (
  <div className="app-shell">
    <SideBar />
    <main className="app-main">
      <Outlet />
    </main>
  </div>
);

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const context = React.useContext(MyContext);

  // Check if user and token exist
  if (!context?.token || !context?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("mygpt:user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user:", error);
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const storedToken = localStorage.getItem("mygpt:token");
      return storedToken && storedToken.trim() ? storedToken : null;
    } catch (error) {
      console.error("Error retrieving stored token:", error);
      return null;
    }
  });

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("mygpt:user", JSON.stringify(user));
      } catch (error) {
        console.error("Error storing user:", error);
      }
    } else {
      localStorage.removeItem("mygpt:user");
    }
  }, [user]);

  // Persist token to localStorage
  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem("mygpt:token", token);
      } catch (error) {
        console.error("Error storing token:", error);
      }
    } else {
      localStorage.removeItem("mygpt:token");
    }
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setPrevChats([]);
    setAllThreads([]);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setNewChat(true);
  }, []);

  const providerValues = useMemo(
    () => ({
      prompt,
      setPrompt,
      reply,
      setReply,
      currThreadId,
      setCurrThreadId,
      newChat,
      setNewChat,
      prevChats,
      setPrevChats,
      allThreads,
      setAllThreads,
      user,
      setUser,
      token,
      setToken,
      logout,
    }),
    [
      prompt,
      reply,
      currThreadId,
      newChat,
      prevChats,
      allThreads,
      user,
      token,
      logout,
    ],
  );

  return (
    <Router>
      <MyContext.Provider value={providerValues}>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<ChatWindow />} />
            <Route path="mockinterview" element={<MockInterview />} />
            <Route path="upgrade" element={<Upgrade />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MyContext.Provider>
    </Router>
  );
}

export default App;
