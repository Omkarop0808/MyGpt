import { useContext, useEffect, useMemo, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import './Chat.css';
import { MyContext } from './MyContext';
import { FaUser, FaRobot } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiCopy, FiCheck } from 'react-icons/fi';

// Custom components for markdown rendering
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return <code className={className} {...props}>{children}</code>;
  }

  return (
    <div className="code-block-container">
      <div className="code-header">
        <span className="language-tag">{language || 'code'}</span>
        <CopyToClipboard text={code} onCopy={handleCopy}>
          <button className="copy-button" aria-label="Copy code">
            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </CopyToClipboard>
      </div>
      <div className="code-content">
        {language ? (
          <SyntaxHighlighter
            language={language}
            style={undefined}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'var(--code-bg)',
              borderRadius: '0 0 6px 6px',
              fontSize: '0.9em',
              lineHeight: 1.5,
            }}
            codeTagProps={{
              style: {
                fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
              },
            }}
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <pre
            className="hljs"
            style={{
              margin: 0,
              padding: '1rem',
              background: 'var(--code-bg)',
              borderRadius: '0 0 6px 6px',
              overflowX: 'auto',
              fontSize: '0.9em',
              lineHeight: 1.5,
            }}
            {...props}
          >
            {children}
          </pre>
        )}
      </div>
    </div>
  );
};

const Link = ({ href, children }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="markdown-link"
  >
    {children}
  </a>
);

const Table = ({ children }) => (
  <div className="markdown-table-container">
    <table className="markdown-table">{children}</table>
  </div>
);

function Chat() {
  const { newChat, prevChats, reply, isTyping } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(true);
  const messagesEndRef = useRef(null);

  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => {
    return Array.isArray(prevChats) ? prevChats : [];
  }, [prevChats]);

  // Handle typing effect for assistant replies
  useEffect(() => {
    if (!reply) {
      setLatestReply('');
      setIsTypingComplete(true);
      return;
    }

    setIsTypingComplete(false);
    let index = 0;
    const words = reply.split(/(\s+)/); // Split by spaces but keep them
    
    const timer = setInterval(() => {
      if (index >= words.length) {
        clearInterval(timer);
        setIsTypingComplete(true);
        return;
      }
      
      setLatestReply(prev => prev + words[index]);
      index += 1;
    }, 16); // ~60fps

    return () => {
      clearInterval(timer);
      setLatestReply('');
    };
  }, [reply]);

  // Auto-scroll to bottom when messages or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, latestReply, isTyping]);

  // Check if we should show the welcome message
  const showWelcome = newChat && messages.length === 0;

  return (
    <div className="chat-stage">
      {showWelcome && (
        <div className="chat-empty">
          <h1>Welcome to MyGPT</h1>
          <p>Ask me anything, explore ideas, or get help with your tasks.</p>
          
          <div className="suggestions">
            <div className="suggestion">
              "Explain quantum computing in simple terms"
            </div>
            <div className="suggestion">
              "Help me debug this Python code"
            </div>
            <div className="suggestion">
              "What are some healthy dinner ideas?"
            </div>
            <div className="suggestion">
              "Write a professional email to a client"
            </div>
          </div>
        </div>
      )}

      <div className="chats">
        {messages.map((message, index) => (
          <div 
            key={`${message.role}-${index}-${message.timestamp || index}`}
            className={`message ${message.role}-message`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? (
                <div className="user-avatar">
                  <FaUser />
                </div>
              ) : (
                <div className="bot-avatar">
                  <FaRobot />
                </div>
              )}
            </div>
            <div className="message-content">
              {renderMessageContent(chat.content)}
              {chat.role === 'assistant' && (
                <div className="message-timestamp">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="message assistant-message">
            <div className="message-avatar">
              <div className="bot-avatar">
                <FaRobot />
              </div>
            </div>
            <div className="message-content">
              {latestReply ? (
                <>
                  {renderMessageContent(latestReply)}
                  <div className="typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </>
              ) : (
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div ref={messagesEndRef} />
      
      {loading && !typing && (
        <div className="loading-indicator">
          <FaSpinner className="spinner" />
          <span>Thinking...</span>
        </div>
      )}
    </div>
  );
}

export default Chat;
