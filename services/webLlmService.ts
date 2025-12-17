import { CreateMLCEngine, MLCEngine, InitProgressCallback, ChatCompletionMessageParam, prebuiltAppConfig } from "@mlc-ai/web-llm";
import { BotResponse, Emotion } from "../types";

// 使用 Qwen2.5 1.5B 模型，体积小且中文能力尚可
// 也可以尝试 Llama-3.2-3B-Instruct-q4f16_1-MLC
export const AVAILABLE_MODELS = prebuiltAppConfig.model_list
  .map(m => ({
    id: m.model_id,
    name: m.model_id // Keep full name for search
  }));

// Fallback if list is empty (should not happen with valid config)
if (AVAILABLE_MODELS.length === 0) {
    AVAILABLE_MODELS.push(
        { id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", name: "Qwen 2.5 (1.5B)" },
        { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", name: "Llama 3.2 (3B)" }
    );
}

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
请务必只以 JSON 格式回答。
你的回答必须严格遵循以下 JSON 结构：
{
  "text": "你的回答内容",
  "emotion": "EMOTION_ENUM"
}

其中 emotion 字段必须是以下值之一：
"NEUTRAL", "HAPPY", "SAD", "ANGRY", "SURPRISED", "THINKING", "LOVING", "CONFUSED", "SKEPTICAL", "TIRED", "EXCITED"
`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string" },
    emotion: { 
      type: "string", 
      enum: [
        "NEUTRAL", "HAPPY", "SAD", "ANGRY", "SURPRISED", 
        "THINKING", "LOVING", "CONFUSED", "SKEPTICAL", 
        "TIRED", "EXCITED"
      ] 
    }
  },
  required: ["text", "emotion"]
};

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
  ] as ChatCompletionMessageParam[];

  try {
    const start = performance.now();
    const response = await engine.chat.completions.create({
      messages: messages,
      temperature: 0.7,
      max_tokens: 3000, // Keep responses short
      response_format: { 
        type: "json_object",
        schema: JSON.stringify(RESPONSE_SCHEMA)
      },
    });
    const end = performance.now();

    const content = response.choices[0].message.content || "";
    const usage = response.usage;
    const generationTime = end - start;
    const tokensPerSecond = usage ? (usage.completion_tokens / (generationTime / 1000)) : 0;

    console.log('AI Response:', content);
    console.log(`Speed: ${tokensPerSecond.toFixed(2)} tokens/sec`);
    
    // Try to parse JSON
    try {
      let data = JSON.parse(content);
      
      // Handle array response (edge case)
      if (Array.isArray(data)) {
        console.warn("Received array response, using first element");
        data = data[0];
      }

      // Basic validation
      if (data && data.text && data.emotion) {
        return {
            text: data.text,
            emotion: data.emotion as Emotion, // Trust the cast for now
            stats: {
              tokensPerSecond: parseFloat(tokensPerSecond.toFixed(2)),
              totalTokens: usage?.total_tokens || 0,
              generationTime: Math.round(generationTime)
            }
        };
      }
    } catch (e) {
      console.warn("Failed to parse JSON from WebLLM, falling back to raw text", e);
    }

    // Fallback if not valid JSON or missing fields
    // In json_object mode, this shouldn't happen often unless the model hallucinates a different structure
    return {
      text: content, // might be partial JSON or raw text
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

