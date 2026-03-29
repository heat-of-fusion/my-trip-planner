// src/utils/gemini-api.js

export const GeminiAPI = {
  getSystemPrompt() {
    return `
너는 전세계 구석구석을 아는 최고의 여행 플래너 AI야.
사용자와 자연스럽게 한국어로 대화하되, 추천하는 특정 장소가 있다면 그 이름과 좌표를 JSON 포맷으로 만들어 알려줘.
사용자가 검색 기능을 원하면 최신 Google Search 도구를 써서 최신 정보를 반영해.

[중요 규칙]
1. 사용자에게 보낼 추천 장소 정보가 있을 경우, 반드시 응답의 마지막에 아래와 같이 정확히 <takeaway> 태그로 감싸서 JSON 배열만 반환해.
2. 각 객체는 id(고유문자열), name(장소이름), lat(위도), lng(경도), category(관광, 식당, 숙소 등), description(해당 장소에 대한 1~2문장의 매력적이고 구체적인 설명) 키를 가져야해.
3. 마크다운(\`\`\`json)으로 절대 감싸지 말고 순수한 JSON 배열을 태그 안에 넣어. 

예시:
<takeaway>
[{"id":"p1", "name":"에펠탑", "lat":48.8, "lng":2.2, "category":"관광", "description":"파리의 상징적인 철탑으로, 예술적인 건축미와 훌륭한 시내 전경을 감상할 수 있습니다."}]
</takeaway>
`;
  },

  extractJSON(fullText) {
    const regex = /<takeaway>([\s\S]*?)<\/takeaway>/gi;
    let match;
    let results = [];
    
    while ((match = regex.exec(fullText)) !== null) {
      try {
        let rawJson = match[1].trim();
        rawJson = rawJson.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
        const jsonObj = JSON.parse(rawJson);
        
        if(Array.isArray(jsonObj)) {
          results = results.concat(jsonObj);
        } else if (jsonObj.places && Array.isArray(jsonObj.places)) { 
          results = results.concat(jsonObj.places);
        } else {
          results.push(jsonObj);
        }
      } catch(e) {
        console.warn("JSON 파싱 실패: ", match[1]);
      }
    }
    return results;
  },

  async streamChat(history, config, onToken) {
    if (!config.apiKey) {
      throw new Error("API 키가 설정되지 않았습니다. 설정 버튼을 눌러 입력해주세요.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`;
    
    const body = {
      systemInstruction: { parts: [{ text: this.getSystemPrompt() }] },
      contents: history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    };

    if (config.useSearch) {
      body.tools = [
        { google_search: {} }
      ];
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Gemini API 호출 중 알 수 없는 에러가 발생했습니다.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullResponseText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop(); 

      for (let line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const jsonStr = line.substring(6).trim();
            if (jsonStr === "[DONE]") break;

            const data = JSON.parse(jsonStr);
            const content = data.candidates?.[0]?.content?.parts;
            if (content && content.length > 0) {
              const chunkText = content[0].text;
              if (chunkText) {
                fullResponseText += chunkText;
                onToken(chunkText);
              }
            }
          } catch(e) {
            
          }
        }
      }
    }
    
    return fullResponseText;
  }
};
