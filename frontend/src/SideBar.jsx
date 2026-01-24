import { useContext, useEffect, useState } from "react";
import "./SideBar.css";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { NavLink, useNavigate } from "react-router-dom";
import { apiRequest } from "./lib/api";

function SideBar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setCurrThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setPrevChats,
    token,
    user,
    logout,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setAllThreads([]);
      return;
    }

    const fetchThreads = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/api/thread", { token });
        const threads = Array.isArray(data?.threads) ? data.threads : [];
        const getTime = (value) => {
          const parsed = Date.parse(value);
          return Number.isNaN(parsed) ? 0 : parsed;
        };
        const sorted = [...threads].sort(
          (a, b) => getTime(b.updated_At) - getTime(a.updated_At),
        );
        setAllThreads(sorted);
      } catch (err) {
        setError(err.message || "Unable to load threads.");
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [token, setAllThreads]);

  const createNewChat = () => {
    const newThreadId = uuidv1();
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(newThreadId);
    setPrevChats([]);
    navigate("/");
  };

  const changeThread = async (threadId) => {
    if (threadId === currThreadId) return;

    try {
      const data = await apiRequest(`/api/thread/${threadId}`, {
        token,
      });

      setCurrThreadId(threadId);
      setPrevChats(data?.messages || []);
      setNewChat(false);
      setReply(null);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to open the thread.");
    }
  };

  const deleteThread = async (threadId) => {
    try {
      setError("");
      await apiRequest(`/api/thread/${threadId}`, {
        method: "DELETE",
        token,
      });

      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      setError(err.message || "Unable to delete the thread.");
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button type="button" onClick={createNewChat} className="sidebar-new">
          <i className="fa-solid fa-plus" />
          <span>New chat</span>
        </button>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <i className="fa-solid fa-comments" />
            Workspace
          </NavLink>
          <NavLink
            to="/mockinterview"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <i className="fa-solid fa-person-chalkboard" />
            Mock Interview
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-label">
          <span>Recent threads</span>
          {loading && <i className="fa-solid fa-rotate spinner" aria-hidden="true" />}
        </div>

        {error && <p className="sidebar-error">{error}</p>}

        <ul className="history">
          {allThreads.map((thread) => (
            <li
              key={thread.threadId}
              className={`history-item ${
                thread.threadId === currThreadId ? "highlighted" : ""
              }`}
            >
              <button type="button" onClick={() => changeThread(thread.threadId)}>
                <span>{thread.title || "Untitled"}</span>
                <time>
                  {thread.updated_At
                    ? new Date(thread.updated_At).toLocaleDateString()
                    : ""}
                </time>
              </button>
              <button
                type="button"
                className="history-delete"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteThread(thread.threadId);
                }}
                aria-label="Delete thread"
              >
                <i className="fa-solid fa-trash" />
              </button>
            </li>
          ))}

          {!allThreads.length && !loading && (
            <li className="history-empty">
              <i className="fa-solid fa-sparkles" aria-hidden="true" />
              <span>Start your first conversation.</span>
            </li>
          )}
        </ul>
      </div>

      <footer className="sidebar-footer">
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user?.name || "User"}</p>
          <p className="sidebar-user-email">{user?.email || ""}</p>
        </div>
        <button type="button" onClick={handleLogout} className="sidebar-logout">
          <i className="fa-solid fa-sign-out-alt" />
          <span>Log out</span>
        </button>
        <p>Made with ❤️ by Omkar</p>
      </footer>
    </aside>
  );
}

export default SideBar;
