import React, { useState, useEffect } from 'react';
import RobotFace from './components/RobotFace';
import ChatInterface from './components/ChatInterface';
import { sendMessageToWebLLM, initializeWebLLM, AVAILABLE_MODELS } from './services/webLlmService';
import { Emotion, BotResponse } from './types';
import { InitProgressReport } from '@mlc-ai/web-llm';

const App: React.FC = () => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [latestResponse, setLatestResponse] = useState<BotResponse | null>({ 
      text: "系统初始化中...", 
      emotion: Emotion.NEUTRAL 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  
  // WebGPU State
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState<string>("等待初始化...");
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Initialize WebLLM on mount or model change
  useEffect(() => {
    const init = async () => {
      setIsModelReady(false);
      try {
        setLatestResponse({ text: "正在加载 WebGPU 模型...", emotion: Emotion.THINKING });
        await initializeWebLLM((report: InitProgressReport) => {
          setLoadProgress(report.text);
        }, selectedModel);
        
        setIsModelReady(true);
        setLatestResponse({ text: "嘿，我醒了。别盯着我看。", emotion: Emotion.SKEPTICAL });
        setCurrentEmotion(Emotion.SKEPTICAL);
      } catch (e) {
        console.error(e);
        setLatestResponse({ text: "该死，模型加载失败了。", emotion: Emotion.ANGRY });
      }
    };
    init();
  }, [selectedModel]);

  // Idle Behavior: Rocket Raccoon style thoughts
  useEffect(() => {
    if (isLoading || !isModelReady) return;

    // Longer idle time
    const timeToNextIdle = 10000 + Math.random() * 20000; // 10-30s

    const timer = setTimeout(() => {
      // Don't interrupt if user is typing (not easily detectable here without more state, but simplistic is fine)
      
      const idleThoughts = [
        { text: "这地方怎么这么无聊...", emotion: Emotion.TIRED },
        { text: "嘿，你还要盯着我看多久？", emotion: Emotion.ANGRY },
        { text: "我在想...如果我有一把大枪...", emotion: Emotion.THINKING },
        { text: "啧，人类。", emotion: Emotion.SKEPTICAL },
        { text: "我是不是应该去修一下我的腿？哦等等，我没有腿。", emotion: Emotion.CONFUSED },
        { text: "嘘... 我好像听到了什么声音。", emotion: Emotion.SURPRISED },
      ];

      const thought = idleThoughts[Math.floor(Math.random() * idleThoughts.length)];
      
      // Update UI to show thought
      setLatestResponse(thought);
      setCurrentEmotion(thought.emotion);

      // Switch back to NEUTRALish after a bit
      setTimeout(() => {
         setCurrentEmotion(Emotion.NEUTRAL);
      }, 3000);

    }, timeToNextIdle);

    return () => clearTimeout(timer);
  }, [currentEmotion, isLoading, isModelReady, latestResponse]); // Re-run when state changes to reset timer

  const handleSendMessage = async (message: string) => {
    if (!isModelReady) return;

    setIsLoading(true);
    setCurrentEmotion(Emotion.THINKING);

    try {
      const response = await sendMessageToWebLLM(message, chatHistory);
      
      setLatestResponse(response);
      setCurrentEmotion(response.emotion);

      // Update history
      const newHistory = [
        ...chatHistory,
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: response.text }] },
      ];
      if (newHistory.length > 20) newHistory.splice(0, newHistory.length - 20);
      setChatHistory(newHistory);

    } catch (error) {
      console.error(error);
      setCurrentEmotion(Emotion.SAD);
      setLatestResponse({ text: "脑子... 卡住了...", emotion: Emotion.SAD });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-black pointer-events-none" />

      {/* The Face */}
      <div className="z-0 w-full h-full absolute inset-0 flex items-center justify-center">
        <RobotFace emotion={currentEmotion} />
      </div>

      {/* Model Selector (Top Right) */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-end">
          <button 
             onClick={() => setShowModelSelector(!showModelSelector)}
             className="text-xs text-gray-500 hover:text-cyan-400 border border-gray-800 rounded px-2 py-1 bg-black/50 backdrop-blur"
          >
             {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Model'} ▼
          </button>
          
          {showModelSelector && (
              <div className="mt-2 bg-black/90 border border-gray-800 rounded p-2 flex flex-col gap-1 min-w-[200px]">
                  {AVAILABLE_MODELS.map(model => (
                      <button
                          key={model.id}
                          onClick={() => {
                              setSelectedModel(model.id);
                              setShowModelSelector(false);
                          }}
                          className={`text-left text-xs px-2 py-1.5 rounded hover:bg-gray-800 ${
                              selectedModel === model.id ? 'text-cyan-400 bg-gray-900' : 'text-gray-400'
                          }`}
                      >
                          {model.name}
                      </button>
                  ))}
              </div>
          )}
      </div>

      {/* Loading Progress Overlay (Only when not ready) */}
      {!isModelReady && (
        <div className="absolute top-24 z-50 flex flex-col items-center gap-2 w-full px-10 pointer-events-none">
            <div className="text-cyan-500 font-mono text-sm animate-pulse">
                INITIALIZING SYSTEM...
            </div>
            <div className="w-full max-w-md h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 animate-pulse w-full origin-left scale-x-50 transition-transform" />
            </div>
             <div className="text-gray-500 text-xs font-mono text-center mt-1 max-w-2xl truncate">
                {loadProgress}
            </div>
        </div>
      )}

      {/* The Chat UI Overlay */}
      <ChatInterface 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        latestResponse={latestResponse}
      />
    </div>
  );
};

export default App;
