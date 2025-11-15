import { useContext, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./Chat.css";
import { MyContext } from "./MyContext";

function Chat() {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  const messages = useMemo(
    () => (Array.isArray(prevChats) ? prevChats : []),
    [prevChats],
  );

  useEffect(() => {
    if (!reply) {
      setLatestReply(null);
      return;
    }

    const words = reply.split(" ");
    let index = 0;

    const timer = setInterval(() => {
      setLatestReply(words.slice(0, index + 1).join(" "));
      index += 1;
      if (index >= words.length) {
        clearInterval(timer);
        setLatestReply(null);
      }
    }, 35);

    return () => clearInterval(timer);
  }, [reply]);

  const trailingMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  const historyMessages =
    latestReply !== null && trailingMessage
      ? messages.slice(0, -1)
      : messages;

  return (
    <div className="chat-stage">
      {newChat && (
        <div className="chat-empty">
          <h1>Start a new chat</h1>
          <p>Ask a question, plan an idea, or explore something new.</p>
        </div>
      )}

      <div className="chats">
        {historyMessages.map((chat, index) => (
          <div
            className={chat.role === "user" ? "userDiv" : "gptDiv"}
            key={`${chat.role}-${index}`}
          >
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}

        {latestReply !== null && (
          <div className="gptDiv" key="typing">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {latestReply}
            </ReactMarkdown>
          </div>
        )}

        {latestReply === null &&
          trailingMessage &&
          trailingMessage.role === "assistant" &&
          typeof trailingMessage.content === "string" && (
            <div className="gptDiv" key="assistant-final">
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {trailingMessage.content}
              </ReactMarkdown>
            </div>
          )}
      </div>
    </div>
  );
}

export default Chat;
