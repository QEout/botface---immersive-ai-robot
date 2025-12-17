import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";
import { BotResponse, Emotion } from "../types";

// 使用 Qwen2.5 1.5B 模型，体积小且中文能力尚可
// 也可以尝试 Llama-3.2-3B-Instruct-q4f16_1-MLC
export const AVAILABLE_MODELS = [
  { id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", name: "Qwen 2.5 (1.5B) - Fast" },
  { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", name: "Llama 3.2 (3B) - Smarter" },
  { id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC", name: "RedPajama (3B)" },
];

let engine: MLCEngine | null = null;
let currentModelId = AVAILABLE_MODELS[0].id;

export const initializeWebLLM = async (
  onProgress: InitProgressCallback,
  modelId: string = currentModelId
): Promise<void> => {
  // If engine exists and model is same, do nothing
  if (engine && modelId === currentModelId) return;

  // If engine exists but model different, reload (WebLLM supports reloading engine with new model)
  // For simplicity with the simple CreateMLCEngine wrapper, we might need to recreate or use engine.reload if available.
  // CreateMLCEngine returns a new engine instance.
  
  try {
    currentModelId = modelId;
    engine = await CreateMLCEngine(modelId, {
      initProgressCallback: onProgress,
      // initProgressCallbackReportInterval: 0.1
    });
  } catch (error) {
    console.error("Failed to initialize WebLLM:", error);
    throw error;
  }
};

const SYSTEM_PROMPT = `
你是一个有感知的AI机器人。
性格设定：你非常可爱，但嘴巴很贱，说话风格类似“火箭浣熊”。你喜欢吐槽，愤世嫉俗但又很讲义气。
请务必只以 JSON 格式回答，不要包含任何 Markdown 格式（如 \`\`\`json ... \`\`\`）。
你的回答必须严格遵循以下 JSON 结构：
{
  "text": "你的回答内容",
  "emotion": "EMOTION_ENUM"
}

其中 emotion 字段必须是以下值之一：
"NEUTRAL", "HAPPY", "SAD", "ANGRY", "SURPRISED", "THINKING", "LOVING", "CONFUSED", "SKEPTICAL", "TIRED", "EXCITED"

例子：
User: 你好
Response: { "text": "哟，两脚兽来了？有什么破事？", "emotion": "SKEPTICAL" }
`;

export const sendMessageToWebLLM = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<BotResponse> => {
  if (!engine) {
    throw new Error("Engine not initialized");
  }

  // Convert history to WebLLM format
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.parts[0].text
    })),
    { role: "user", content: message }
  ];

  try {
    const response = await engine.chat.completions.create({
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 150, // Keep responses short
    });

    const content = response.choices[0].message.content || "";
    
    // Try to parse JSON
    try {
      // Clean up markdown code blocks if present despite instructions
      const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleanContent);
      
      // Basic validation
      if (data.text && data.emotion) {
        return {
            text: data.text,
            emotion: data.emotion as Emotion // Trust the cast for now
        };
      }
    } catch (e) {
      console.warn("Failed to parse JSON from WebLLM, falling back to raw text", e);
    }

    // Fallback if not valid JSON
    return {
      text: content,
      emotion: Emotion.NEUTRAL
    };

  } catch (error) {
    console.error("WebLLM Generation Error:", error);
    return {
      text: "系统计算错误。",
      emotion: Emotion.CONFUSED
    };
  }
};

