# Gemini API 연동 가이드라인 (Virtual Research Lab 프로젝트 분석)

본 문서는 `Virtual Research Lab` 프로젝트에서 사용된 Gemini API 연동 방식을 상세히 분석하여, 다른 프로젝트에서 즉시 재사용할 수 있도록 정리한 기술 가이드라인입니다.

---

## 1. API 기본 설정 (Authentication & Endpoints)

Gemini API는 Google AI Studio에서 발급받은 API 키를 사용하며, 클라이언트 측에서 직접 호출하는 방식을 취합니다.

### API 엔드포인트
- **기본 URL**: `https://generativelanguage.googleapis.com/v1beta/models`
- **일반 생성**: `/{model}:generateContent?key={API_KEY}`
- **스트리밍 생성**: `/{model}:streamGenerateContent?alt=sse&key={API_KEY}`

### 모델 선택
- **Gemini 3.1 Flash Lite**: 속도와 비용 효율성이 중요할 때 (기본값)
- **Gemini 3.1 Pro**: 복잡한 추론이나 정교한 페르소나 유지가 필요할 때

---

## 2. 데이터 구조 및 호출 방식

### A. 일반적인 JSON 응답 호출
구조화된 결과가 필요할 때(예: 데이터 추출, 계획 수립) 사용합니다. `generationConfig.responseMimeType`을 `"application/json"`으로 설정하는 것이 핵심입니다.

```javascript
async function callGeminiJSON(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json" // JSON 결과 강제
      }
    })
  });
  
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawText);
}
```

### B. 스트리밍(Streaming) 호출
실시간 대화 인터페이스를 위해 SSE(Server-Sent Events) 방식을 사용합니다.

```javascript
async function streamGemini(contents, systemPrompt, apiKey, onChunk) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:streamGenerateContent?alt=sse&key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: contents, // 대화 내역 (history)
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 1.0, maxOutputTokens: 8192 }
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // 완전하지 않은 라인 보관

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const json = JSON.parse(line.substring(6));
          const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
          onChunk(chunk); // 실시간 텍스트 전달
        } catch (e) {}
      }
    }
  }
}
```

---

## 3. 계층적 컨텍스트 관리 (Context Hierarchy)

단순한 대화를 넘어 깊이 있는 페르소나를 유지하기 위한 전략입니다.

1.  **System Instruction (정체성)**: 캐릭터의 역할, 성격, 배경지식, 말투 가이드.
2.  **Long-Term Memory (장기 기억)**: 과거 대화에서 추출된 핵심 정보 (봇별로 별도 관리).
3.  **Room Summary (상황 요약)**: 현재 채팅방에서 일어난 주요 사건들에 대한 요약.
4.  **Short-Term History (최근 대화)**: 직전 10~15개 정도의 메시지만 포함하여 토큰 효율화.
5.  **Multi-Room Context**: 다른 방에서 일어난 일을 인지시켜 세계관 통합.

---

## 4. 멀티모달 (이미지 입력) 처리

Gemini API는 이미지 데이터(Base64)를 `inline_data` 객체로 직접 받을 수 있습니다.

```javascript
const contents = [{
  role: "user",
  parts: [
    { text: "이 슬라이드 내용을 요약해줘." },
    {
      inline_data: {
        mime_type: "image/jpeg",
        data: "base64_string_data_here" // data:image/jpeg;base64, 부분은 제외
      }
    }
  ]
}];
```

---

## 5. 지능형 설계 패턴: Chat Planner

여러 AI 캐릭터가 동시에 대화에 참여할 가능성이 있는 경우, **발화 가이드(Planner)** 단계를 먼저 거칩니다.

1.  사용자 입력 발생.
2.  **Planner 호출**: 현재 상황과 캐릭터들의 상태를 전달하여 "누가 응답할지", "어떤 의도로 대답할지" 결정.
3.  **순차적 응답 생성**: 결정된 계획에 따라 캐릭터별로 시차를 두고 응답 생성.
4.  **폭주 방지**: 모든 캐릭터가 한꺼번에 대답하지 않게 조절하여 인간적인 대화 흐름 형성.

---

## 6. 오류 처리 및 최적화 전략

- **지수 백오프(Exponential Backoff)**: 429(Quota Exceeded) 에러 시 일정 시간 대기 후 재시도.
- **Takeaway 추출**: 응답 마지막에 `<takeaway>` 태그를 쓰게 하여 실시간으로 기억 요소를 자동 추출.
- **안전한 JSON 파싱**: AI가 마크다운 코드 블록 등으로 JSON을 감쌀 경우를 대비하여 `replace` 및 정규식으로 순수 JSON만 추출하는 유틸리티 사용 권장.

---
> [!TIP]
> **Virtual Research Lab**의 구현 방식은 클라이언트 측에서 직접 대규모 언어 모델을 제어하면서도 정교한 상태 관리와 페르소나를 유지하는 훌륭한 레퍼런스입니다.
