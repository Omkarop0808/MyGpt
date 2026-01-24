import { useContext, useEffect, useMemo, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import './Chat.css';
import { MyContext } from './MyContext';
import { FaUser, FaRobot, FaSpinner } from 'react-icons/fa';
import { FiCopy, FiCheck } from 'react-icons/fi';

// Custom components for markdown rendering
const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (inline) {
    return <code className={className} {...props}>{children}</code>;
  }

  return (
    <div className="code-block-container">
      <div className="code-header">
        <span className="language-tag">{language || 'code'}</span>
        <button className="copy-button" onClick={handleCopy} aria-label="Copy code">
          {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="code-content">
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
          <code className={className}>{children}</code>
        </pre>
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

// Render message content with markdown support
const renderMessageContent = (content) => {
  if (!content) return null;
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code: CodeBlock,
        a: Link,
        table: Table,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

function Chat() {
  const { newChat, prevChats, reply, setPrompt } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Memoize messages to prevent unnecessary re-renders
  const messages = useMemo(() => {
    return Array.isArray(prevChats) ? prevChats : [];
  }, [prevChats]);

  // Handle typing effect for assistant replies
  useEffect(() => {
    if (!reply) {
      setLatestReply('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let index = 0;
    const words = reply.split(/(\s+)/); // Split by spaces but keep them
    
    const timer = setInterval(() => {
      if (index >= words.length) {
        clearInterval(timer);
        setIsTyping(false);
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

  // Handle suggestion click
  const handleSuggestionClick = (text) => {
    // Remove quotes from suggestion text
    const cleanText = text.replace(/^"|"$/g, '');
    setPrompt(cleanText);
  };

  return (
    <div className="chat-stage">
      {showWelcome && (
        <div className="chat-empty">
          <h1>Welcome to MyGPT</h1>
          <p>Ask me anything, explore ideas, or get help with your tasks.</p>
          
          <div className="suggestions">
            <div 
              className="suggestion"
              onClick={() => handleSuggestionClick("Explain quantum computing in simple terms")}
            >
              "Explain quantum computing in simple terms"
            </div>
            <div 
              className="suggestion"
              onClick={() => handleSuggestionClick("Help me debug this Python code")}
            >
              "Help me debug this Python code"
            </div>
            <div 
              className="suggestion"
              onClick={() => handleSuggestionClick("What are some healthy dinner ideas?")}
            >
              "What are some healthy dinner ideas?"
            </div>
            <div 
              className="suggestion"
              onClick={() => handleSuggestionClick("Write a professional email to a client")}
            >
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
              {renderMessageContent(message.content)}
              {message.role === 'assistant' && (
                <div className="message-timestamp">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && latestReply && (
          <div className="message assistant-message">
            <div className="message-avatar">
              <div className="bot-avatar">
                <FaRobot />
              </div>
            </div>
            <div className="message-content">
              {renderMessageContent(latestReply)}
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Chat;
