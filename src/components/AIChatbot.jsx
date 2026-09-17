import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/img/hireiq-logo.png';
import '../css/chatbot.css';
import { aiApi } from '../api/ai.js';

const INITIAL_GREETING =
  "Hello! 👋 I'm your HireIQ AI Assistant. How can I help you today with resume screening, candidate ranking, or skill gap analysis?";

const QUICK_SUGGESTIONS = [
  '📄 How to upload resumes?',
  '👥 How are candidates ranked?',
  '📊 What is Skill Gap Analysis?',
  '💼 How to create a job role?',
  '📈 How to export reports?',
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: INITIAL_GREETING,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isExpanded]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingId(null);
    }
  }, [isOpen]);

  // Dismiss on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      window.alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*•#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const generateBotReply = (userQuery) => {
    const query = userQuery.toLowerCase().trim();

    if (
      query.includes('hello') ||
      query.includes('hi') ||
      query.includes('hey') ||
      query.includes('hola') ||
      query.includes('kemon acho')
    ) {
      return "Hello! 😊 I'm here to assist you with HireIQ. You can ask me about uploading resumes, candidate rankings, skill gap evaluations, or creating job roles.";
    }

    if (
      query.includes('upload') ||
      query.includes('resume') ||
      query.includes('cv') ||
      query.includes('file') ||
      query.includes('pdf')
    ) {
      return "To upload resumes:\n1. Click **'Resume Upload'** in the left sidebar or the **'Upload Resume'** header button.\n2. Drag & drop your `.pdf`, `.doc`, or `.docx` file into the upload zone.\n3. HireIQ AI will instantly parse the candidate's skills, experience, and match score!";
    }

    if (
      query.includes('candidate') ||
      query.includes('ranking') ||
      query.includes('shortlist') ||
      query.includes('rating') ||
      query.includes('score')
    ) {
      return "Candidates are automatically ranked based on semantic skill matches and job requirements:\n• **Candidates Page**: View all talent, star ratings, and review feedback.\n• **Filters**: Filter by specific job roles or active/shortlisted status.\n• **Export**: Click the Export button to download candidates data as a CSV file.";
    }

    if (
      query.includes('skill') ||
      query.includes('gap') ||
      query.includes('competency') ||
      query.includes('readiness')
    ) {
      return "The **Skill Gap Analysis** dashboard compares candidate abilities against current industry benchmarks:\n• See technical vs soft skill distribution.\n• View top in-demand competencies (JavaScript, Python, SQL, React, Java).\n• Identify priority learning gaps to improve hiring alignment by up to 18%!";
    }

    if (
      query.includes('job') ||
      query.includes('role') ||
      query.includes('position') ||
      query.includes('create role')
    ) {
      return "To manage Job Roles:\n1. Navigate to **'Job Roles'** on the left menu.\n2. Click the **'+ Create New Role'** button.\n3. Enter the role title, department, experience level, and required core skills.\n4. HireIQ will automatically match new resumes to this role!";
    }

    if (
      query.includes('report') ||
      query.includes('export') ||
      query.includes('analytics') ||
      query.includes('download')
    ) {
      return "To access reports:\n1. Go to the **'Reports'** page.\n2. Select your desired date range (e.g. This Month, Last 90 Days).\n3. Click **'Generate Report'** or export specific breakdowns like Candidate Summary, Interview Funnel, and Source Effectiveness.";
    }

    if (
      query.includes('setting') ||
      query.includes('password') ||
      query.includes('email') ||
      query.includes('profile') ||
      query.includes('theme') ||
      query.includes('dark mode')
    ) {
      return "In **Settings** you can:\n• Update your Administrator profile and email notifications.\n• Change your account password securely.\n• Toggle between **Light Mode** and **Dark Mode** via the moon/sun icon in the top header.";
    }

    if (
      query.includes('price') ||
      query.includes('cost') ||
      query.includes('plan') ||
      query.includes('pro') ||
      query.includes('upgrade')
    ) {
      return "HireIQ offers 3 flexible plans:\n• **Starter** ($9/mo): 50 resume screenings & monthly summaries.\n• **Pro** ($29/mo): Unlimited AI parsing, deep skill analysis & priority support.\n• **Enterprise** (Custom): Dedicated pipelines & API access.\nClick **'Upgrade to Pro'** on the sidebar to learn more!";
    }

    if (
      query.includes('thank') ||
      query.includes('thanks') ||
      query.includes('helpful') ||
      query.includes('dhonnobad')
    ) {
      return "You're very welcome! Feel free to ask whenever you need any assistance with HireIQ. Happy hiring! 🚀";
    }

    return "Thanks for asking! I can help you with **Resume Upload**, **Candidate Screening**, **Skill Gap Analysis**, **Job Roles**, **Reports**, or **Account Settings**. Please ask any question about the platform.";
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiApi.chat(query);
      const replyText = res?.data?.reply || generateBotReply(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const replyText = generateBotReply(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleChipClick = (suggestion) => {
    const cleanPrompt = suggestion.replace(/^[^\w\s]+/, '').trim();
    handleSendMessage(cleanPrompt);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="chatbot-launcher">
        <button
          type="button"
          className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`}
          aria-label={isOpen ? 'Close HireIQ Assistant' : 'Open HireIQ Assistant'}
          title={isOpen ? 'Close Chat' : 'HireIQ Assistant'}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <>
              <i className="fa-solid fa-xmark"></i>
              <span className="chatbot-btn-text">Close</span>
            </>
          ) : (
            <>
              <div className="chatbot-btn-logo-wrap">
                <img src={logo} alt="HireIQ Logo" className="chatbot-btn-logo" />
              </div>
              <span className="chatbot-btn-text">HireIQ Assistant</span>
              <span className="chatbot-btn-dot"></span>
            </>
          )}
        </button>
      </div>

      {/* Chatbot Pop-up Panel */}
      {isOpen && (
        <div
          className={`chatbot-panel ${isExpanded ? 'expanded' : ''}`}
          role="dialog"
          aria-label="HireIQ AI Chatbot"
        >
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-logo-wrap">
                <img src={logo} alt="HireIQ Logo" className="chatbot-hdr-logo" />
              </div>
              <div className="chatbot-title-wrap">
                <h3>
                  HireIQ Assistant{' '}
                  <i
                    className="fa-solid fa-bolt"
                    style={{ color: '#ffd36a', fontSize: '11px' }}
                  ></i>
                </h3>
                <span className="chatbot-status">
                  <span className="chatbot-status-dot"></span> Online & Ready
                </span>
              </div>
            </div>

            <div className="chatbot-header-actions">
              {/* Full Page / Half Page Button */}
              <button
                type="button"
                className="chatbot-hdr-btn"
                aria-label={isExpanded ? 'Half page view' : 'Full page view'}
                title={isExpanded ? 'Half page view' : 'Full page view'}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <i
                  className={`fa-solid fa-${isExpanded ? 'compress' : 'up-right-and-down-left-from-center'}`}
                ></i>
              </button>

              {/* Close Button */}
              <button
                type="button"
                className="chatbot-hdr-btn"
                aria-label="Close chat"
                title="Close chat"
                onClick={() => setIsOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-msg-row ${msg.sender}`}>
                <div className="chatbot-bubble">
                  {msg.text.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>

                <div className="chatbot-msg-meta">
                  <span className="chatbot-time">{msg.time}</span>
                  {msg.sender === 'bot' && (
                    <button
                      type="button"
                      className={`chatbot-speaker-btn ${speakingId === msg.id ? 'speaking' : ''}`}
                      aria-label={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                      title={speakingId === msg.id ? 'Stop reading' : 'Listen to answer'}
                      onClick={() => speakText(msg.id, msg.text)}
                    >
                      <i
                        className={`fa-solid fa-volume-${speakingId === msg.id ? 'high' : 'low'}`}
                      ></i>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-msg-row bot">
                <div className="chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips - Only show initially before chatting */}
          {messages.length <= 1 && (
            <div className="chatbot-suggestions-wrap">
              <div className="chatbot-suggestions-title">Suggested Topics</div>
              <div className="chatbot-suggestions-list">
                {QUICK_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chatbot-chip"
                    onClick={() => handleChipClick(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form className="chatbot-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask HireIQ AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
