import React, { useState, useContext } from 'react';
import { MyContext } from './MyContext';
import { apiRequest } from './lib/api';
import { ClipLoader } from 'react-spinners';
import './Analysis.css';

function Analysis() {
  const { token } = useContext(MyContext);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await apiRequest('/api/interview/analysis', {
        method: 'POST',
        body: { text },
        token,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analysis-container">
      <h1>Content Analysis</h1>
      <p className="subtitle">Improve your writing with AI-powered analysis and suggestions.</p>

      <form onSubmit={handleAnalyze} className="analysis-form">
        <div className="form-group">
          <label htmlFor="text-input">Your Text</label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your essay, email, or resume section here..."
            required
            rows={10}
            className="analysis-textarea"
          />
        </div>

        <button type="submit" disabled={loading} className="analyze-btn" style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? <ClipLoader size={20} color="#fff" /> : 'Analyze Text'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {result && (
        <div className="result-grid">
          <div className="result-card grammar">
            <h3>Grammar Issues</h3>
            {result.grammar && result.grammar.length > 0 ? (
              <ul>
                {result.grammar.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="clean-slate">No grammar issues found! 🎉</p>
            )}
          </div>

          <div className="result-card clarity">
            <h3>Clarity Improvements</h3>
            {result.clarity && result.clarity.length > 0 ? (
              <ul>
                {result.clarity.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="clean-slate">Text is clear and concise.</p>
            )}
          </div>

          <div className="result-card suggestions">
            <h3>Impact Suggestions</h3>
            {result.suggestions && result.suggestions.length > 0 ? (
              <ul>
                {result.suggestions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="clean-slate">No specific impact suggestions.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Analysis;
