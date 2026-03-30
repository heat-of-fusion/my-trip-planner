# 🌍 AI Trip Planner: Neon Journey

> **당신의 여행에 인공지능의 영감을 더하세요.**  
> Gemini 3.1 Pro 기반의 스마트한 일정 계획과 인터랙티브 지도가 결합된 차세대 여행 플래너입니다.

---

## ✨ 핵심 기능 (Key Features)

### 🤖 **Gemini AI 기반 대화형 플래닝**
- **강력한 추론**: Google의 최신 Gemini 3.1 모델을 사용하여 사용자의 취향에 맞는 최적의 경로와 장소를 추천합니다.
- **실시간 검색 결합**: Google Search Retrieval 기능을 통해 숨겨진 로컬 맛집부터 최신 축제 정보까지 반영합니다.
- **맥락 유지**: 사용자가 거절한 장소는 기억하여 다음 추천에서 제외하는 스마트한 컨텍스트 관리를 제공합니다.

### 🗺️ **인터랙티브 네온 맵 (Leaflet)**
- **실시간 동기화**: AI가 추천한 장소가 즉시 지도상에 마커로 표시됩니다.
- **가중치 시스템**: 각 장소의 중요도(Weight)를 설정하면 마커의 크기와 네온 효과가 실시간으로 변화하여 우선순위를 시각화합니다.
- **핀-투-챗 (Pin-to-Chat)**: 지도상의 마커를 클릭하여 해당 장소에 대한 정보를 채팅창에서 즉시 확인할 수 있습니다.

### 💎 **프리미엄 글래스모피즘 UI**
- **Sleek Design**: 다크 모드 기반의 투명한 유리 질감과 선명한 네온 액센트 컬러를 사용한 현대적인 UI.
- **반응형 레이아웃**: `react-resizable-panels`를 활용하여 지도와 사이드바의 비율을 사용자의 편의에 맞게 자유롭게 조절 가능합니다.

### 🔒 **보안 및 프라이버시 (BYOK)**
- **Bring Your Own Key**: 사용자의 API 키는 서버에 저장되지 않고 오직 사용자의 브라우저(`localStorage`)에만 저장됩니다.
- **오픈 소스 친화적**: 민감 정보가 소스 코드에 노출되지 않는 안전한 구조로 설계되었습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React (Vite), Framer Motion, Lucide React
- **Maps**: Leaflet, React-Leaflet
- **AI Integration**: Google Gemini API (Pro/Flash Lite)
- **Styling**: Vanilla CSS (Custom Glassmorphism)
- **Layout**: React Resizable Panels

---

## 🚀 시작하기 (Getting Started)

### 1. 필수 조건
- [Google AI Studio](https://aistudio.google.com/)에서 발급받은 **Gemini API Key**가 필요합니다. (무료 티어 사용 가능)

### 2. 설치 및 실행
```bash
# 저장소 복제
git clone https://github.com/your-username/my-trip-planner.git

# 의존성 설치
npm install

# 로컬 실행
npm run dev
```

### 3. API 키 설정
앱 실행 후, 우측 상단의 ⚙️ **환경 설정** 버튼을 눌러 발급받은 API 키를 입력하세요. 키가 유효하면 즉시 AI 플래닝을 시작할 수 있습니다.

---

## 📖 문서 (Documentation)

- [Gemini API 연동 가이드](./Gemini_API_Guide.md): 본 프로젝트에 적용된 AI 아키텍처 및 프롬프트 엔지니어링 기법에 대한 상세 설명서입니다.

---

## 🛡️ 라이선스 (License)

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자유롭게 포크하고 개선해 보세요!

---
