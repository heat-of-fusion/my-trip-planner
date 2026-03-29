// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { GeminiAPI } from '../utils/gemini-api';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface({ 
  chatHistory, 
  setChatHistory, 
  settings, 
  onAiSuggestions,
  onNewMessage,
  confirmedPlaces,
  rejectedPlaces,
  setSelectedDebug
}) {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [tempSystemMsg, setTempSystemMsg] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, tempSystemMsg]);

  // 스트리밍 도중 불완전한 닫기 태그가 없더라도($) takeaway를 숨김 처리
  const hideTakeaways = (text) => {
    if(!text) return '';
    return text.replace(/<takeaway>[\s\S]*?(<\/takeaway>|$)/gi, '').trim();
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    if(onNewMessage) onNewMessage();

    const userText = input;
    setInput('');
    const newHistory = [...chatHistory, { role: 'user', parts: [{ text: userText }] }];
    setChatHistory(newHistory);
    setIsThinking(true);
    setTempSystemMsg('');

    try {
      const responseObj = await GeminiAPI.streamChat(
        newHistory,
        settings,
        (chunk) => {
          setTempSystemMsg((prev) => prev + chunk);
        },
        {
          confirmed: confirmedPlaces.map(p => p.name).join(', '),
          rejected: rejectedPlaces.map(p => p.name).join(', ')
        }
      );

      const fullText = responseObj.text;
      const fullParts = responseObj.parts;

      const jsonPlaces = GeminiAPI.extractJSON(fullText);
      if (jsonPlaces.length > 0) {
        onAiSuggestions(jsonPlaces);
      }

      setChatHistory([
        ...newHistory,
        { 
          role: 'model', 
          parts: fullParts,
          debugInfo: { 
            sentPrompt: responseObj.sentPrompt,
            parts: fullParts 
          }
        }
      ]);
      setTempSystemMsg('');
    } catch (err) {
      alert(`[오류]: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="chat-section glass-panel">
      <div className="chat-header">
        <h2>✨ AI 트립 어시스턴트</h2>
      </div>
      <div className="chat-messages">
        {chatHistory.length === 0 && (
          <div className="message system-msg">
            <div className="msg-content">
              <ReactMarkdown>안녕하세요! 어디로 여행을 떠나고 싶으신가요?</ReactMarkdown>
            </div>
          </div>
        )}
        
        {chatHistory.map((msg, idx) => {
          const rawText = msg.parts ? msg.parts.map(p => p.text).join('') : '';
          const cleanContent = hideTakeaways(rawText);
          const finalDisplay = cleanContent || '(추천 리스트를 업데이트했습니다)';

          return (
            <div key={idx} className={`message ${msg.role === 'user' ? 'user-msg' : 'system-msg'}`}>
              <div className="msg-content">
                <ReactMarkdown>{finalDisplay}</ReactMarkdown>
                {msg.debugInfo && (
                  <button 
                    className="debug-trigger" 
                    title="프롬프트 디버그 정보 보기"
                    onClick={() => setSelectedDebug(msg.debugInfo)}
                  >
                    🔍
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {isThinking && (
          <div className="message system-msg">
            <div className="msg-content">
              <ReactMarkdown>{hideTakeaways(tempSystemMsg) || '지도를 탐색하는 중...'}</ReactMarkdown>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요 (Shift + Enter로 전송)..."
        />
        <button onClick={handleSend} disabled={isThinking} className="primary-btn">
          {isThinking ? '탐색중...' : '전송'}
        </button>
      </div>

      <style>{`
        .chat-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 15px;
          min-height: 0;
        }
        .chat-header h2 { font-size: 1.1rem; margin-bottom: 10px; }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 15px;
          padding-right: 5px;
        }
        .message {
          max-width: 85%;
          font-size: 0.9rem;
          line-height: 1.5;
          word-break: break-word;
          position: relative;
        }
        .msg-content {
          position: relative;
        }
        .debug-trigger {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 0.65rem;
          padding: 2px 4px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: white;
        }
        .message:hover .debug-trigger {
          opacity: 1;
        }
        .system-msg .msg-content {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-backdrop);
          border: 1px solid var(--glass-border);
          padding: 14px 18px;
          border-radius: 14px 14px 14px 0;
          box-shadow: var(--glass-shadow);
        }
        .user-msg {
          align-self: flex-end;
        }
        .user-msg .msg-content {
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(189, 0, 255, 0.1));
          backdrop-filter: var(--glass-backdrop);
          border: 1px solid rgba(0, 240, 255, 0.3);
          padding: 14px 18px;
          border-radius: 14px 14px 0 14px;
          box-shadow: var(--glass-shadow);
        }
        .msg-content p {
          margin-bottom: 8px;
        }
        .msg-content p:last-child {
          margin-bottom: 0;
        }
        .msg-content strong {
          color: var(--accent-neon);
        }
        .msg-content ul, .msg-content ol {
          margin-left: 20px;
          margin-bottom: 8px;
        }
        .msg-content a {
          color: #fff;
          text-decoration: underline;
        }
        .chat-input-area {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        textarea {
          width: 100%;
          height: 60px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          padding: 10px;
          border-radius: 8px;
          resize: none;
          font-family: inherit;
        }
        textarea:focus {
          outline: none;
          border-color: var(--accent-neon);
        }
      `}</style>
    </section>
  );
}
