import { useContext, useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiPlus, FiSettings, FiLogOut, FiUser, FiZap } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { ScaleLoader } from "react-spinners";
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import ErrorBoundary from "./ErrorBoundary";
import { apiRequest, isAuthError } from "./lib/api";

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
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // Handle input changes
  const handleInput = (e) => {
    setPrompt(e.target.value);
    adjustTextareaHeight();
  };

  // Handle key down events
  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (prompt.trim() && !loading) {
        getReply();
      }
    }
  };

  // Handle composition events for IME input
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // Toggle user menu
  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navbar-actions')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [prevChats, reply]);

  const getReply = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || loading) {
      return;
    }

    if (!token) {
      setApiError("Session expired. Please sign in again.");
      navigate("/login");
      return;
    }

    setLoading(true);
    setApiError("");
    setNewChat(false);
    
    // Add user message to chat
    const userMessage = {
      role: "user",
      content: trimmedPrompt,
      timestamp: new Date().toISOString()
    };

    setPrevChats(prev => [...(Array.isArray(prev) ? prev : []), userMessage]);
    setPrompt("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

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
        // Update thread and messages
        setCurrThreadId(data.thread.threadId);
        setPrevChats(data.thread.messages || []);
        
        // Update all threads list
        setAllThreads(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const threadIndex = safePrev.findIndex(t => t.threadId === data.thread.threadId);
          
          if (threadIndex >= 0) {
            // Update existing thread
            const updated = [...safePrev];
            updated[threadIndex] = {
              ...updated[threadIndex],
              title: data.thread.title || updated[threadIndex].title,
              updated_At: data.thread.updated_At || new Date().toISOString(),
              preview: data.thread.messages?.[data.thread.messages.length - 1]?.content || ""
            };
            return [updated[threadIndex], ...updated.slice(0, threadIndex), ...updated.slice(threadIndex + 1)];
          } else {
            // Add new thread
            return [{
              threadId: data.thread.threadId,
              title: data.thread.title || trimmedPrompt.slice(0, 50) + (trimmedPrompt.length > 50 ? '...' : ''),
              updated_At: data.thread.updated_At || new Date().toISOString(),
              preview: data.thread.messages?.[data.thread.messages.length - 1]?.content || ""
            }, ...safePrev];
          }
        });
      }

      setReply(data?.reply || "");
    } catch (error) {
      console.error('Chat API error:', error);
      
      let errorMessage = "An error occurred while processing your request.";
      
      if (isAuthError(error)) {
        errorMessage = "Your session has expired. Please sign in again.";
        logout();
        navigate("/login");
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Add error message to chat
      setPrevChats(prev => [
        ...(Array.isArray(prev) ? prev : []),
        {
          role: "assistant",
          content: `⚠️ **Error**: ${errorMessage}`,
          isError: true,
          timestamp: new Date().toISOString()
        }
      ]);
      
      setApiError(errorMessage);
    } finally {
      setLoading(false);
      
      // Focus back on the input after a short delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  const handleLogout = async () => {
    try {
      // Optional: Call logout API if needed
      // await apiRequest('/api/auth/logout', { method: 'POST', token });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const handleNewChat = () => {
    setNewChat(true);
    setCurrThreadId(null);
    setPrevChats([]);
    setReply("");
  };

  return (
    <div className="chatWindow">
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="navbar-title">
          <span>MyGPT</span>
          <small>Conversation Workspace</small>
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-user"
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-label="User menu"
          >
            <div className="navbar-user-initials">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="navbar-user-details">
              <strong>{user?.name || 'User'}</strong>
              <span>{user?.email || ''}</span>
            </div>
            <i className={`fas fa-chevron-${isMenuOpen ? 'up' : 'down'}`} />
          </button>

          {/* Dropdown Menu */}
          <div 
            className="dropDown" 
            role="menu" 
            aria-orientation="vertical" 
            aria-hidden={!isMenuOpen}
            data-visible={isMenuOpen}
          >
            <button 
              type="button" 
              className="dropDownItem"
              onClick={() => {
                setIsMenuOpen(false);
                // Handle preferences
              }}
            >
              <FiSettings size={16} />
              <span>Preferences</span>
            </button>
            <button 
              type="button" 
              className="dropDownItem"
              onClick={() => {
                setIsMenuOpen(false);
                // Handle upgrade
              }}
            >
              <FiZap size={16} />
              <span>Upgrade Plan</span>
            </button>
            <div className="divider" />
            <button 
              type="button" 
              className="dropDownItem danger"
              onClick={handleLogout}
            >
              <FiLogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="chat-container">
        <ErrorBoundary>
          <Chat />
          <div ref={messagesEndRef} />
        </ErrorBoundary>
      </main>

      {/* Error Message */}
      {apiError && (
        <div className="chat-error" role="alert">
          <i className="fas fa-exclamation-circle" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="chatInput">
        {loading && (
          <div className="loading-indicator">
            <ScaleLoader color="#10a37f" height={16} width={3} margin={1} />
            <span>AI is thinking...</span>
          </div>
        )}
        
        <div className="inputBox">
          <div className="new-chat-btn" onClick={handleNewChat} title="New chat">
            <FiPlus size={20} />
          </div>
          
          <textarea
            ref={textareaRef}
            placeholder="Ask me anything..."
            value={prompt}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            rows={1}
            disabled={loading}
            aria-label="Type your message"
          />
          
          <button
            type="button"
            onClick={getReply}
            disabled={!prompt.trim() || loading}
            aria-label="Send message"
            className="send-button"
          >
            <FiSend size={18} />
          </button>
        </div>
        
        <div className="input-footer">
          <small>
            MyGPT can make mistakes. Consider verifying important information.
          </small>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
