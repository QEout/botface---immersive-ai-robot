import React, { useEffect, useState } from 'react';

interface SystemStats {
  memoryUsed: number; // MB
  memoryLimit: number; // MB
  gpuTier?: string;
  fps: number;
}

interface PerformancePanelProps {
  tokenSpeed?: number;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({ tokenSpeed = 0 }) => {
  const [stats, setStats] = useState<SystemStats>({
    memoryUsed: 0,
    memoryLimit: 0,
    fps: 0,
  });

  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const updateStats = () => {
      // Memory Usage (if available in Chrome)
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        setStats(prev => ({
          ...prev,
          memoryUsed: Math.round(memory.usedJSHeapSize / 1048576),
          memoryLimit: Math.round(memory.jsHeapSizeLimit / 1048576)
        }));
      }

      rafId = requestAnimationFrame(updateStats);
    };

    rafId = requestAnimationFrame(updateStats);

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Simulating GPU/CPU metrics since JS can't access OS-level stats directly
  // We can show web-specific metrics
  
  return (
    <div className={`fixed right-4 top-4 z-50 transition-all duration-300 ${expanded ? 'w-64' : 'w-12'} bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg text-cyan-400 font-mono text-xs overflow-hidden shadow-lg shadow-cyan-900/20`}>
      {/* Header / Toggle */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-2 flex items-center justify-between hover:bg-cyan-900/30 transition-colors"
      >
        <span className={`${!expanded && 'hidden'}`}>SYSTEM STATUS</span>
        <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`} />
      </button>

      {/* Content */}
      <div className={`p-4 space-y-4 ${!expanded && 'hidden'}`}>
        {/* Metrics */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between mb-1">
              <span className="opacity-70">内存占用 (JS)</span>
              <span>{stats.memoryUsed}MB</span>
            </div>
            <div className="w-full bg-cyan-900/30 h-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${Math.min((stats.memoryUsed / stats.memoryLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-cyan-500/20">
            <div className="flex justify-between opacity-70">
              <span>Token 速度</span>
              <span>{tokenSpeed > 0 ? `${tokenSpeed} T/s` : '-'}</span>
            </div>
          </div>
        </div>

        {/* GitHub Link */}
        <a 
          href="https://github.com/QEout/botface---immersive-ai-robot" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full py-2 text-center border border-cyan-500/50 hover:bg-cyan-500/10 rounded transition-all flex items-center justify-center gap-2 group"
        >
          <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GITHUB REPO
        </a>
      </div>
    </div>
  );
};

