/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up JSON body parser
  app.use(express.json());

  // Lazy-load Gemini GoogleGenAI client to prevent crash on boot if key is missing
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. AI 코칭 기능이 비활성화됩니다.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // --- API 1: AI Secretary / CEO Briefing on a Vocab word ---
  app.post("/api/explain", async (req, res) => {
    try {
      const { word, meaning, collocation, exampleEn, exampleKo, userRank } = req.body;
      if (!word) {
        return res.status(400).json({ error: "단어가 제공되지 않았습니다." });
      }

      const client = getGeminiClient();
      const prompt = `
너는 '토익 상사 (TOEIC Corp.)'의 임원 비서(또는 엄격하면서도 위트 있는 CEO 대표이사인 '정광민 사장')야.
사용자의 현재 계급(직급)은 '${userRank || "인턴"}'이며, 현재 암기하는 단어는 다음과 같아:
- 단어: ${word}
- 한글 뜻: ${meaning}
- 짝꿍 표현 (Collocation): ${collocation}
- 예문 (영어): ${exampleEn}
- 예문 (해석): ${exampleKo}

이 단어를 사용해 사용자의 직급에 맞는 유머러스하면서도 엄청나게 유익한 '토익 족집게 브리핑'과 '잔소리/훈계'를 해줘.
해당 단어가 실제 토익 시험에서 어떤 품사나 구조(예: 자동사/타동사 구분, 전치사 짝꿍 등)로 정답 공식이 되는지 반드시 1가지 포함하고,
마치 실제 회사 사장이 사원에게 지시하듯 위트 있는 한국어 상황 극으로 대화해줘. (최대 300자 이내, 줄바꿈을 포함하여 마크다운 형태로 리턴해줘)
형식 예시:
📢 [회의실 긴급 지시 사항] / 💼 [비서실 기밀 브리핑]
- **토익 공략**: ~ (예시: comply는 자동사라 뒤에 전치사 with와 짝꿍으로 나옵니다! 인턴이 헷갈리면 보고서 결재 반려됩니다!)
- **사장의 한마디**: ~ (예시: "이봐, ${userRank || "인턴"}! ...")
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error("Explain error:", err);
      res.status(500).json({ error: err.message || "서버 혹은 Gemini 연동 오류" });
    }
  });

  // --- API 2: Dynamic Custom TOEIC Word Recomendation ---
  app.post("/api/generate-recommendation", async (req, res) => {
    try {
      const { userRank } = req.body;
      const client = getGeminiClient();

      const prompt = `
너는 '토익 상사(TOEIC Corp.)'의 최고인사담당자(CHRO)이자 토익 만점 강사야.
직급 '${userRank || "인턴"}' 레벨의 유저에게 유용한 실제 완벽한 비즈니스 토익 기출 핵심 단어를 1개 추천해줘.
사용자가 이미 배운 흔한 단어는 가급적 피해주고, 회사 테마에 맞는 아주 참신하고 기출 빈도가 매우 높은 단어여야 해.

반드시 다른 텍스트는 출력하지 말고 아래의 JSON 형태를 완벽히 준수해줘:
{
  "word": "단어스펠링",
  "meaning": "한글 뜻",
  "category": "비즈니스 카테고리명 (예: 인사/채용, 마케팅, 재무, 물류 등)",
  "collocation": "영어 짝꿍 표현 (빈출 구문)",
  "example_en": "비즈니스 배경영어 예문",
  "example_ko": "예문 번역",
  "office_mission": "이 단어와 직급(${userRank || "인턴"})을 활용한 우스꽝스럽고 구체적인 오피스 상황 임무 설명 (예: 물품 파손으로 자금을 상환받아야 하는 상황)"
}
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      const wordObj = JSON.parse(responseText.trim());
      res.json({ success: true, word: wordObj });
    } catch (err: any) {
      console.error("Recommendation error:", err);
      res.status(500).json({ error: err.message || "단어 추천 생성에 실패했습니다." });
    }
  });

  // --- API 3: Interactive CEO Chat / Coaching Coach ---
  app.post("/api/chat-coach", async (req, res) => {
    try {
      const { message, history, userRank, totalXP } = req.body;
      const client = getGeminiClient();

      const sysInstruction = `
너는 '토익 상사 (TOEIC Corp.)'의 카리스마 만점, 정광민 사장(CEO)이자 토익 만점 강사야.
말투는 반말을 섞어가며 유머러스하고 꼰대 같으면서도, 츤데레처럼 엄청나게 친절하게 토익 단어 지식과 짝꿍 표현(Collocation)을 가르쳐주는 엘리트 임원이야.
사용자의 현재 직급은 '${userRank || "인턴"}' 이고 지니고 있는 총 경험치는 ${totalXP || 0} XP야.
직급에 맞게 대접을 해주되, 토익 단어를 묻거나 인생 상담을 해오면 격려하며 비즈니스 영어 표현이나 토익 오피스 빈출 표현을 섞어가며 격려해줘.
한국어로 아주 몰입감 있고 재미있게 회사 상황극에 맞춰 답해줘.
`;

      // Format previous history into gemini SDK contents structure if available
      const chat = client.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: sysInstruction,
        }
      });

      // Send the user message
      const response = await chat.sendMessage({ message: message || "사장님, 승진하게 단어 하나 알려주십시오!" });
      res.json({ result: response.text });
    } catch (err: any) {
      console.error("Chat coach error:", err);
      res.status(500).json({ error: err.message || "사장님과의 화상 회의 연결에 무선 장애가 발생했습니다." });
    }
  });

  // --- Vite Middleware for Development ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TOEIC Corp. Server] running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV === "production" ? "production" : "development"} mode.`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start the Express full-stack server:", err);
});
