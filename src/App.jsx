// src/App.jsx
import React, { useState, useEffect } from 'react';
import MapSection from './components/MapSection';
import PlacesList from './components/PlacesList';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import PlaceConfirmModal from './components/PlaceConfirmModal';
import './index.css';

function App() {
  const [places, setPlaces] = useState([]);
  
  // 새로 추가된 상태들
  const [pendingPlaces, setPendingPlaces] = useState([]); 
  const [rejectedPlaces, setRejectedPlaces] = useState([]);
  const [isRecovering, setIsRecovering] = useState(false); // 거절 목록 모달 여부

  const [chatHistory, setChatHistory] = useState([]);
  const [settings, setSettings] = useState({
    apiKey: localStorage.getItem('gemini_api_key') || '',
    model: 'gemini-3.1-flash-lite-preview',
    useSearch: true
  });
  const [showSettings, setShowSettings] = useState(false);

  // 초기 API 키 모달
  useEffect(() => {
    if (!settings.apiKey) {
      const timer = setTimeout(() => setShowSettings(true), 500);
      return () => clearTimeout(timer);
    }
  }, [settings.apiKey]);

  // 가중치 업데이트 (리스트에서)
  const handleUpdateWeight = (id, newWeight) => {
    setPlaces(prev => 
      prev.map(p => p.id === id ? { ...p, weight: newWeight } : p)
    );
  };

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    localStorage.setItem('gemini_api_key', newSettings.apiKey);
  };

  // AI로부터 추천 장소가 도착했을 때 (ChatInterface 콜백)
  const handleAiSuggestions = (suggestions) => {
    // 이미 추가된 장소는 필터링
    const newPlaces = suggestions.filter(s => !places.find(p => p.id === s.id));
    if(newPlaces.length > 0) {
      setPendingPlaces(newPlaces);
    }
  };

  // 모달에서 선택을 완료했을 때 (승인 목록, 거절 목록)
  const handleModalConfirm = (selected, rejected) => {
    // 1. 선택된 아이템들 메인 리스트로 추가 (기본 가중치 5 설정)
    if(selected.length > 0) {
      const toAdd = selected.map(p => ({ ...p, weight: p.weight || 5 }));
      setPlaces(prev => [...prev, ...toAdd]);
    }
    
    // 2. 거절된 아이템들은 나중 복구를 위해 보관
    if(rejected.length > 0) {
      setRejectedPlaces(prev => {
         // 중복 제거하여 합치기
         const combined = [...prev, ...rejected];
         const unique = combined.filter((v,i,a) => a.findIndex(t => (t.id === v.id)) === i);
         return unique;
      });
    }

    // 대기열 비우기 및 모달 닫기
    setPendingPlaces([]);
    setIsRecovering(false); 
  };

  // 채팅을 시작할 때: 이전 턴의 거절된 항목들 완전 폐기
  const handleNewMessage = () => {
    setRejectedPlaces([]);
  };

  return (
    <main className="app-container">
      {/* 1. 왼쪽: 지도 영역 */}
      <MapSection 
        places={places} 
        onOpenSettings={() => setShowSettings(true)} 
      />

      {/* 2. 오른쪽: 사이드 패널 (상/하 분할) */}
      <aside className="side-panel" style={{position: 'relative'}}>
        
        {/* 거절 목록 복구 버튼 (거부된 항복이 있을 때만 렌더링) */}
        {rejectedPlaces.length > 0 && (
          <button 
            className="glass-btn recovery-btn" 
            onClick={() => {
              setPendingPlaces(rejectedPlaces); 
              setRejectedPlaces([]); 
              setIsRecovering(true);
            }}
          >
            ♻️ 버려진 일정 {rejectedPlaces.length}개 복구하기
          </button>
        )}

        <PlacesList 
          places={places} 
          updateWeight={handleUpdateWeight} 
        />
        <ChatInterface 
          chatHistory={chatHistory} 
          setChatHistory={setChatHistory} 
          settings={settings}
          onAiSuggestions={handleAiSuggestions}
          onNewMessage={handleNewMessage}
        />
      </aside>

      {/* 3. 모달 레이어들 */}
      
      {/* 3-1. 설정 모달 */}
      {showSettings && (
        <SettingsModal 
          settings={settings} 
          setSettings={handleSettingsSave} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      {/* 3-2. 장소 확인 모달 (AI 응답 직후 또는 복구 버튼 클릭 시) */}
      {(pendingPlaces.length > 0) && (
        <PlaceConfirmModal 
          pendingPlaces={pendingPlaces}
          onConfirm={handleModalConfirm}
        />
      )}

      <style>{`
        .side-panel {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 15px;
          gap: 15px;
          background: rgba(18, 18, 18, 0.8);
          border-left: 1px solid var(--glass-border);
        }
        .recovery-btn {
          position: absolute;
          top: 10px;
          left: -20px;
          transform: translateX(-100%);
          z-index: 1000;
          background: rgba(189, 0, 255, 0.2);
          border: 1px solid var(--accent-purple);
          color: var(--text-primary);
          animation: fadeInUp 0.3s ease;
        }
        .recovery-btn:hover {
          background: rgba(189, 0, 255, 0.4);
        }
      `}</style>
    </main>
  );
}

export default App;
