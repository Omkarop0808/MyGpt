import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { ScaleLoader } from "react-spinners";
import ErrorBoundary from "./ErrorBoundary";
import { apiRequest } from "./lib/api";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setReply,
    currThreadId,
    setCurrThreadId,
    setPrevChats,
    setNewChat,
    setAllThreads,
    token,
    user,
    logout,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const userInitials = useMemo(() => {
    if (!user?.name) return "ME";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getReply = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || loading) {
      return;
    }

    if (!token) {
      setApiError("Session expired. Sign in again.");
      navigate("/login");
      return;
    }

    setLoading(true);
    setApiError("");
    setNewChat(false);
    setPrevChats((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      {
        role: "user",
        content: trimmedPrompt,
      },
    ]);

    try {
      const data = await apiRequest("/api/chat", {
        method: "POST",
        body: {
          message: trimmedPrompt,
          threadId: currThreadId,
        },
        token,
      });

      if (data?.thread) {
        setCurrThreadId(data.thread.threadId);
        setPrevChats(data.thread.messages || []);
        setAllThreads((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const next = safePrev.filter(
            (thread) => thread.threadId !== data.thread.threadId,
          );
          next.unshift({
            threadId: data.thread.threadId,
            title: data.thread.title || "New Chat",
            updated_At: data.thread.updated_At || new Date().toISOString(),
          });
          return next;
        });
      }

      setReply(data?.reply || "");
    } catch (error) {
      const errorMessage = error.message || "Unable to get a response right now.";
      console.error(`Chat error:`, error);
      
      // Show helpful error message
      const displayMessage = errorMessage.includes("overloaded") 
        ? "⚠️ API is busy. Retrying automatically... Please wait a moment."
        : errorMessage;
      
      setPrevChats((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        if (safePrev.length === 0) {
          return [];
        }
        // Keep user message, add error as assistant response
        return [
          ...safePrev.slice(0, -1),
          safePrev[safePrev.length - 1],
          {
            role: "assistant",
            content: "⚠️ " + displayMessage + "\n\n🔄 The system will automatically retry. Please wait...",
          },
        ];
      });
      setApiError(displayMessage);
    } finally {
      setPrompt("");
      setLoading(false);
    }
  };

  return (
    <div className="chatWindow">
      <header className="navbar">
        <div className="navbar-title">
          <span>MYGPT</span>
          <small>Conversation workspace</small>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-user"
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <span className="navbar-user-initials">{userInitials}</span>
            <div className="navbar-user-details">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.email}</span>
            </div>
            <i className={`fa-solid fa-chevron-${isMenuOpen ? "up" : "down"}`} />
          </button>

          {isMenuOpen && (
            <div className="dropDown" role="menu">
              <button type="button" className="dropDownItem">
                <i className="fa-solid fa-gear" aria-hidden="true" />
                Preferences
              </button>
              <button type="button" className="dropDownItem">
                <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" />
                Upgrade plan
              </button>
              <button type="button" className="dropDownItem" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <ErrorBoundary>
        <Chat />
      </ErrorBoundary>

      {apiError && (
        <div className="chat-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="chatInput">
        <ScaleLoader color="#60a5fa" loading={loading} className="loader" />
        <div className="inputBox">
          <input
            placeholder="Ask anything to start a new idea…"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                getReply();
              }
            }}
          />
          <button
            id="submit"
            type="button"
            onClick={getReply}
            disabled={loading}
            aria-label="Send message"
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
        <p className="info">
          Outputs are generated with Gemini. Review important information before taking action.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
