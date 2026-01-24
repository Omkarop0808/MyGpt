import React, { useState, useContext } from 'react';
import { MyContext } from './MyContext';
import { apiRequest } from './lib/api';
import { ClipLoader } from 'react-spinners';
import './MockInterview.css';

function MockInterview() {
  const { token } = useContext(MyContext);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await apiRequest('/api/interview/ask', {
        method: 'POST',
        body: { question, answer },
        token,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to get feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mock-interview-container">
      <h1>Mock Interview Interface</h1>
      <p className="subtitle">Practice your tech interview questions and get AI feedback.</p>

      <form onSubmit={handleSubmit} className="interview-form">
        <div className="form-group">
          <label htmlFor="question">Interview Question</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Explain the difference between Let and Var"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="answer">Your Answer</label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your detailed answer here..."
            required
            rows={6}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn" style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? <ClipLoader size={20} color="#fff" /> : 'Get Feedback'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {result && (
        <div className="result-container">
          <h2>AI Feedback</h2>
          
          <div className="score-badge">
            Score: <span>{result.score}/10</span>
          </div>

          <div className="result-section">
            <h3>Feedback</h3>
            <p>{result.feedback}</p>
          </div>

          <div className="result-section">
            <h3>Better Answer</h3>
            <p className="better-answer">{result.betterAnswer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockInterview;
