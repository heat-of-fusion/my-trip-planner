// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import MapSection from './components/MapSection';
import PlacesList from './components/PlacesList';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import PlaceConfirmModal from './components/PlaceConfirmModal';
import DebugModal from './components/DebugModal';
import './index.css';

function App() {
  const [places, setPlaces] = useState(() => {
    const saved = localStorage.getItem('trip_places');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [pendingPlaces, setPendingPlaces] = useState([]); 
  const [rejectedPlaces, setRejectedPlaces] = useState([]);
  const [isRecovering, setIsRecovering] = useState(false);

  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('trip_chat_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('trip_settings');
    const defaultSettings = {
      apiKey: localStorage.getItem('gemini_api_key') || '',
      model: 'gemini-3.1-flash-lite-preview',
      useSearch: true,
      splitDirection: 'vertical'
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [showSettings, setShowSettings] = useState(false);

  // 데이터 변경 시 localStorage 자동 저장
  useEffect(() => {
    localStorage.setItem('trip_places', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem('trip_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('trip_settings', JSON.stringify(settings));
    if (settings.apiKey) {
      localStorage.setItem('gemini_api_key', settings.apiKey);
    }
  }, [settings]);

  useEffect(() => {
    if (!settings.apiKey) {
      const timer = setTimeout(() => setShowSettings(true), 500);
      return () => clearTimeout(timer);
    }
  }, [settings.apiKey]);

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

  const handleDeletePlace = (id) => {
    if(window.confirm("이 장소를 목록에서 삭제할까요?")) {
      setPlaces(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAiSuggestions = (suggestions) => {
    // 복잡한 대조 없이 이번 턴에 AI가 추천한 것만 그대로 노출
    if(suggestions.length > 0) {
      setPendingPlaces(suggestions);
    }
  };

  const handleModalConfirm = (selected, rejected) => {
    if(selected.length > 0) {
      const toAdd = selected.map(p => ({ ...p, weight: p.weight || 5 }));
      setPlaces(prev => [...prev, ...toAdd]);
    }
    
    if(rejected.length > 0) {
      setRejectedPlaces(prev => {
         const combined = [...prev, ...rejected];
         const unique = combined.filter((v,i,a) => a.findIndex(t => (t.id === v.id)) === i);
         return unique;
      });
    }

    setPendingPlaces([]);
    setIsRecovering(false); 
  };

  const handleNewMessage = () => {
    setRejectedPlaces([]);
  };

  const handleResetData = () => {
    if (window.confirm("정말로 모든 여행 데이터(일정, 대화 내역)를 초기화할까요? 저장된 데이터가 영구적으로 삭제됩니다.")) {
      localStorage.removeItem('trip_places');
      localStorage.removeItem('trip_chat_history');
      setPlaces([]);
      setChatHistory([]);
      alert("데이터가 초기화되었습니다.");
    }
  };

  const [selectedDebug, setSelectedDebug] = useState(null);
  const [locatedPlaceId, setLocatedPlaceId] = useState(null);

  const handleLocatePlace = (id) => {
    setLocatedPlaceId(id);
    // 2초 후 하이라이트 효과를 위한 상태 초기화
    setTimeout(() => setLocatedPlaceId(null), 2500);
  };

  return (
    <main className="app-container" style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}>
      
      {/* 1. 최상단 수평 분할 (지도 | 사이드바) */}
      <PanelGroup orientation="horizontal">
        
        {/* 왼쪽: 지도 패널 */}
        <Panel defaultSize={65} minSize={30}>
          <MapSection 
            places={places} 
            onOpenSettings={() => setShowSettings(true)} 
            onDeletePlace={handleDeletePlace}
            onLocatePlace={handleLocatePlace}
          />
        </Panel>

        <PanelResizeHandle className="resize-handle horizontal">
          <div className="resize-handle-inner"></div>
        </PanelResizeHandle>

        {/* 오른쪽: 사이드바 패널 */}
        <Panel defaultSize={35} minSize={25} style={{ background: 'rgba(18, 18, 18, 0.8)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
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

          {/* 2. 사이드바 내부 분할 (설정에 따라 상하/좌우 변경) */}
          <PanelGroup 
            key={settings.splitDirection} 
            orientation={settings.splitDirection === 'horizontal' ? 'horizontal' : 'vertical'}
          >
            
            <Panel defaultSize={50} minSize={20}>
              <div style={{ height: '100%', width: '100%', padding: '15px 15px 4px 15px', display: 'flex', flexDirection: 'column' }}>
                <PlacesList 
                  places={places} 
                  updateWeight={handleUpdateWeight} 
                  onDelete={handleDeletePlace}
                  locatedPlaceId={locatedPlaceId}
                />
              </div>
            </Panel>

            <PanelResizeHandle className={`resize-handle ${settings.splitDirection === 'horizontal' ? 'horizontal' : 'vertical'}`}>
              <div className="resize-handle-inner"></div>
            </PanelResizeHandle>

            <Panel defaultSize={50} minSize={20}>
              <div style={{ height: '100%', width: '100%', padding: '4px 15px 15px 15px', display: 'flex', flexDirection: 'column' }}>
                <ChatInterface 
                  chatHistory={chatHistory} 
                   setChatHistory={setChatHistory} 
                  settings={settings}
                  onAiSuggestions={handleAiSuggestions}
                  onNewMessage={handleNewMessage}
                  confirmedPlaces={places}
                  rejectedPlaces={rejectedPlaces}
                  setSelectedDebug={setSelectedDebug}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

      </PanelGroup>

      {/* 모달 레이어들 (최상위 배치하여 전역 팝업 효과) */}
      {showSettings && (
        <SettingsModal 
          settings={settings} 
          setSettings={handleSettingsSave} 
          onClose={() => setShowSettings(false)} 
          onResetData={handleResetData}
        />
      )}

      {selectedDebug && (
        <DebugModal 
          debugData={selectedDebug} 
          onClose={() => setSelectedDebug(null)} 
        />
      )}

      {(pendingPlaces.length > 0) && (
        <PlaceConfirmModal 
          pendingPlaces={pendingPlaces}
          onConfirm={handleModalConfirm}
        />
      )}

      <style>{`
        .resize-handle {
          position: relative;
          background-color: transparent;
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        /* 세로선 (좌우 분할) */
        .resize-handle.horizontal { 
          width: 8px; 
          cursor: col-resize; 
        }
        
        /* 가로선 (상하 분할) */
        .resize-handle.vertical { 
          height: 8px; 
          cursor: row-resize; 
        }
        
        .resize-handle:hover {
          background-color: rgba(0, 240, 255, 0.05);
        }
        
        .resize-handle-inner { 
          background-color: transparent; 
          border-radius: 4px; 
          transition: all 0.3s ease;
        }
        
        /* 네온 라인이 정확히 중앙에 위치하도록 함 */
        .resize-handle:hover .resize-handle-inner,
        .resize-handle[data-resize-handle-state="hover"] .resize-handle-inner,
        .resize-handle[data-resize-handle-state="drag"] .resize-handle-inner {
          background-color: var(--accent-neon);
          box-shadow: 0 0 15px var(--accent-neon);
        }

        .resize-handle.horizontal .resize-handle-inner { width: 2px; height: 40px; }
        .resize-handle.vertical .resize-handle-inner { width: 40px; height: 2px; }
        
        .recovery-btn { 
          position: absolute; 
          top: 15px; 
          left: -15px; 
          transform: translateX(-100%); 
          z-index: 1000; 
          background: rgba(189, 0, 255, 0.25); 
          border: 1px solid var(--accent-purple); 
          color: var(--text-primary); 
        }
      `}</style>
    </main>
  );
}

export default App;
