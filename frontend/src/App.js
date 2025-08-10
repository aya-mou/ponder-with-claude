/*This page handles the chat functionality. It first asks the user to input an access code. 
It communicates the user input with Claude through the Anthropic API.
It also includes a connectivity check with the Anthropic API. */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, User, MessageSquare } from 'lucide-react';
import './App.css';

// Backend API URL - change this when you deploy
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user was previously authenticated
  useEffect(() => {
    const savedAuth = localStorage.getItem('ponder-auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Check backend connection on component mount
  useEffect(() => {
    if (isAuthenticated) {
      checkBackendConnection();
    }
  }, [isAuthenticated]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setConnectionStatus('error');
    }
  };

  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    // Simple access code check (you can change this)
    if (accessCode === 'OpusPonder08-25!') {
      setIsAuthenticated(true);
      localStorage.setItem('ponder-auth', 'true');
    } else {
      alert('Invalid access code. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    if (connectionStatus !== 'connected') {
      alert('Backend server is not connected. Please make sure it\'s running on http://localhost:5001');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch(`${API_BASE_URL}/api/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          model: 'claude-opus-4-1-20250805',
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.content[0].text;

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error calling backend:', error);
      let errorMessage = `Sorry, I encountered an error: ${error.message}`;
      
      if (error.message.includes('fetch')) {
        errorMessage += '\n\nMake sure your backend server is running on http://localhost:5001';
      }
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the height based on scroll height
    const baseHeight = 56; // Accounts for padding (16px top + 16px bottom = 32px) + line height (24px)
    const lineHeight = 24;
    const maxLines = 4;
    const minHeight = baseHeight;
    const maxHeight = baseHeight + (lineHeight * (maxLines - 1));
    
    let newHeight = Math.min(textarea.scrollHeight, maxHeight);
    newHeight = Math.max(newHeight, minHeight);
    
    textarea.style.height = newHeight + 'px';
  };

  const startNewChat = () => {
    setMessages([]);
    // Reset textarea height when starting new chat
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Backend Connected';
      case 'error': return 'Backend Disconnected';
      default: return 'Checking Connection...';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="access-code-screen">
        <div className="access-code-container">
          <div className="access-code-header">
            <div className="logo-icon">
              <MessageSquare size={48} strokeWidth={1.5} />
            </div>
            <h1 className="access-title">Ponder with Claude</h1>
            <p className="access-subtitle">Please enter access code to continue.</p>
          </div>
          
          <form onSubmit={handleAccessCodeSubmit} className="access-form">
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Access Code"
              className="access-input"
              autoFocus
            />
            <button type="submit" className="access-submit">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewChat}>
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>
        
        <div className="chat-history">
          {/* Placeholder for chat history */}
        </div>
        
        <div className="sidebar-footer">
          {/* Connection Status */}
          <div className="connection-status">
            <div className="connection-indicator">
              <div 
                className="status-dot"
                style={{ backgroundColor: getConnectionStatusColor() }}
              ></div>
              <span className="status-text">{getConnectionStatusText()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="claude-logo">
              <div className="logo-icon">
                <MessageSquare size={48} strokeWidth={1.5} />
              </div>
              <h1 className="claude-title">Ponder with Claude</h1>
              <p className="claude-subtitle">How can I help you today?</p>
            </div>
            
            {connectionStatus === 'error' && (
              <div className="error-banner">
                <p>⚠️ Backend server is not connected. Please start your backend server.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="messages-container">
            <div className="messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'user' ? (
                      <div className="user-avatar">
                        <User size={18} />
                      </div>
                    ) : (
                      <div className="claude-avatar">
                        <MessageSquare size={18} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      {formatMessage(message.content)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <div className="claude-avatar">
                      <MessageSquare size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="input-container">
          <div className="input-wrapper">
            <div className="input-box">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={connectionStatus === 'connected' ? "Message Claude..." : "Backend server not connected..."}
                className="message-input"
                rows="1"
                disabled={isLoading || connectionStatus !== 'connected'}
              />
              <button 
                onClick={sendMessage} 
                className={`send-btn ${inputValue.trim() && !isLoading && connectionStatus === 'connected' ? 'active' : ''}`}
                disabled={!inputValue.trim() || isLoading || connectionStatus !== 'connected'}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;