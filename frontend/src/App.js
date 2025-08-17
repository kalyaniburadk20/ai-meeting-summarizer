import React, { useState } from 'react';

// --- Unique Dark & Teal Styles ---
const styles = {
  body: {
    backgroundColor: '#070F18', // Very dark blue background for the page
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: `'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  },
  container: {
    width: '100%',
    maxWidth: '750px',
    margin: 'auto',
    padding: '40px',
    backgroundColor: '#0D1B2A', // Main card background
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    border: '1px solid #1B263B',
  },
  header: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#3DDC97', // Teal accent color
    textAlign: 'center',
    marginBottom: '35px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#A3C9C7', // Light teal/blue for labels
    marginBottom: '12px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    borderRadius: '12px',
    border: '1.5px solid #1B263B',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#1B263B',
    color: '#E0E8F7',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  textarea: {
    width: '100%',
    minHeight: '160px',
    padding: '14px 18px',
    fontSize: '16px',
    borderRadius: '12px',
    border: '1.5px solid #1B263B',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    backgroundColor: '#1B263B',
    color: '#E0E8F7',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  button: {
    width: '100%',
    padding: '15px 24px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#3DDC97',
    color: '#0D1B2A',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    marginTop: '20px',
  },
  buttonDisabled: {
    backgroundColor: '#2c5b4c',
    color: '#6c8a86',
    cursor: 'not-allowed',
  },
  section: {
    marginBottom: '28px',
  },
  summarySection: {
    marginTop: '35px',
    borderTop: '1px solid #1B263B',
    paddingTop: '35px',
  },
  message: {
    marginTop: '20px',
    padding: '14px',
    borderRadius: '10px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '16px',
  },
  errorMessage: {
    backgroundColor: 'rgba(228, 90, 104, 0.2)',
    color: '#E45A68',
    border: '1px solid #E45A68',
  },
  successMessage: {
    backgroundColor: 'rgba(61, 220, 151, 0.2)',
    color: '#3DDC97',
    border: '1px solid #3DDC97',
  },
};

// Add focus styles dynamically
const focusStyle = {
  borderColor: '#3DDC97',
  boxShadow: '0 0 0 3px rgba(61, 220, 151, 0.3)',
};

function App() {
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('Summarize in bullet points');
  const [summary, setSummary] = useState('');
  const [recipients, setRecipients] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState({});

  const handleFocus = (name) => setIsFocused({ ...isFocused, [name]: true });
  const handleBlur = (name) => setIsFocused({ ...isFocused, [name]: false });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setTranscript(evt.target.result);
      reader.readAsText(file);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    setMessage('');
    setSummary('');
    setIsSuccess(false);

    try {
      const response = await fetch('https://ai-meeting-summarizer-rs84.onrender.com/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, prompt }),
      });
      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
      } else {
        setMessage(data.message || 'Failed to generate summary');
        setIsSuccess(false);
      }
    } catch (err) {
      setMessage('Error connecting to the server. Please ensure the backend is running.');
      setIsSuccess(false);
    }
    setLoading(false);
  };

  const sendEmail = async () => {
    setIsEmailLoading(true);
    setMessage('');
    setIsSuccess(false);
    const recipientList = recipients.split(',').map(r => r.trim()).filter(r => r);

    try {
      const response = await fetch('https://ai-meeting-summarizer-rs84.onrender.com/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients: recipientList, content: summary }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Email sent successfully!');
        setIsSuccess(true);
      } else {
        setMessage(data.message || 'Failed to send email');
        setIsSuccess(false);
      }
    } catch (err) {
      setMessage('Error connecting to the server.');
      setIsSuccess(false);
    }
    setIsEmailLoading(false);
  };
  
  const getButtonStyle = (disabled) => {
    let style = { ...styles.button };
    if (disabled) {
      style = { ...style, ...styles.buttonDisabled };
    }
    return style;
  };

  document.body.style.backgroundColor = styles.body.backgroundColor;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>AI Meeting Summarizer</h1>

      <div style={styles.section}>
        <label style={styles.label}>Upload Transcript (.txt file)</label>
        <input type="file" accept="text/plain" onChange={handleFileUpload} />
      </div>
      
      <div style={styles.section}>
        <label style={styles.label}>Or Paste Transcript</label>
        <textarea
          style={{ ...styles.textarea, ...(isFocused.transcript ? focusStyle : {}) }}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onFocus={() => handleFocus('transcript')}
          onBlur={() => handleBlur('transcript')}
          placeholder="Paste your full meeting transcript here..."
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Custom Instruction / Prompt</label>
        <input
          type="text"
          style={{ ...styles.input, ...(isFocused.prompt ? focusStyle : {}) }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => handleFocus('prompt')}
          onBlur={() => handleBlur('prompt')}
          placeholder="e.g., Extract action items"
        />
      </div>
      
      <button
        style={getButtonStyle(loading || !transcript || !prompt)}
        onClick={generateSummary}
        disabled={loading || !transcript || !prompt}
      >
        {loading ? 'Generating...' : 'Generate Summary'}
      </button>

      {summary && (
        <div style={styles.summarySection}>
          <div style={styles.section}>
            <label style={styles.label}>Generated Summary (Editable)</label>
            <textarea
              rows={12}
              style={{ ...styles.textarea, ...(isFocused.summary ? focusStyle : {}) }}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onFocus={() => handleFocus('summary')}
              onBlur={() => handleBlur('summary')}
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Share via Email (comma-separated)</label>
            <input
              type="email"
              style={{ ...styles.input, ...(isFocused.recipients ? focusStyle : {}) }}
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              onFocus={() => handleFocus('recipients')}
              onBlur={() => handleBlur('recipients')}
              placeholder="friend@example.com, colleague@example.com"
            />
          </div>
          
          <button
            style={getButtonStyle(isEmailLoading || !recipients || !summary)}
            onClick={sendEmail}
            disabled={isEmailLoading || !recipients || !summary}
          >
            {isEmailLoading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      )}

      {message && (
        <p style={{ ...styles.message, ...(isSuccess ? styles.successMessage : styles.errorMessage) }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
