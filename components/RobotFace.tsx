import React, { useEffect, useState, useRef } from 'react';
import { Emotion } from '../types';

interface RobotFaceProps {
  emotion: Emotion;
}

const RobotFace: React.FC<RobotFaceProps> = ({ emotion }) => {
  const [internalEmotion, setInternalEmotion] = useState<Emotion>(emotion);
  const [blinkState, setBlinkState] = useState(false);
  const blinkIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync internal emotion with prop, but allow override for blinking
  useEffect(() => {
    setInternalEmotion(emotion);
  }, [emotion]);

  // Blinking logic
  useEffect(() => {
    const setupBlink = () => {
      const delay = Math.random() * 3000 + 2000; // Random blink between 2-5 seconds
      blinkIntervalRef.current = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => {
          setBlinkState(false);
          setupBlink(); // Schedule next blink
        }, 150); // Blink duration
      }, delay);
    };

    setupBlink();

    return () => {
      if (blinkIntervalRef.current) clearTimeout(blinkIntervalRef.current);
    };
  }, []);

  // Determine styles based on emotion state
  // We manipulate SVG properties to animate
  const getEyeShape = (side: 'left' | 'right') => {
    if (blinkState) {
      return { ry: 1, height: 2, y: 40 }; // Closed eye
    }

    switch (internalEmotion) {
      case Emotion.HAPPY:
        // Chevrons / Arches
        return { ry: 10, height: 20, y: 35, rotate: side === 'left' ? -10 : 10 }; 
      case Emotion.SAD:
        // Droopy
        return { ry: 8, height: 16, y: 45, rotate: side === 'left' ? 20 : -20 };
      case Emotion.ANGRY:
        // Slanted inward
        return { ry: 5, height: 15, y: 40, rotate: side === 'left' ? 20 : -20 };
      case Emotion.SURPRISED:
        // Wide open
        return { ry: 18, height: 36, y: 32, rotate: 0 };
      case Emotion.THINKING:
        // One eye squinting
        if (side === 'left') return { ry: 2, height: 4, y: 40 }; 
        return { ry: 12, height: 24, y: 38, rotate: -15 };
      case Emotion.LOVING:
        // Arches with slight rotation, maybe I'll handle heart shape in render if needed, but for now happy eyes
        return { ry: 10, height: 20, y: 35, rotate: side === 'left' ? -10 : 10 };
      case Emotion.CONFUSED:
         // Mismatched
         if (side === 'left') return { ry: 12, height: 24, y: 38, rotate: 0 };
         return { ry: 4, height: 8, y: 40, rotate: 0 };
      case Emotion.SKEPTICAL:
        // Flat
        return { ry: 4, height: 8, y: 40, rotate: 0 };
      case Emotion.TIRED:
        // Droopy and low
        return { ry: 2, height: 4, y: 45, rotate: side === 'left' ? 10 : -10 };
      case Emotion.EXCITED:
         // Big and wide
         return { ry: 15, height: 30, y: 35, rotate: 0 };
      default: // NEUTRAL
        return { ry: 12, height: 24, y: 38, rotate: 0 };
    }
  };

  const getEyebrowShape = (side: 'left' | 'right') => {
    const baseY = 20;
    
    switch (internalEmotion) {
        case Emotion.HAPPY:
            return { y: baseY - 5, rotate: side === 'left' ? -10 : 10 };
        case Emotion.SAD:
            return { y: baseY, rotate: side === 'left' ? -20 : 20 };
        case Emotion.ANGRY:
            return { y: baseY + 5, rotate: side === 'left' ? 25 : -25 };
        case Emotion.SURPRISED:
            return { y: baseY - 15, rotate: side === 'left' ? -5 : 5 };
        case Emotion.THINKING:
             return { y: baseY - 5, rotate: side === 'left' ? 0 : 15 };
        case Emotion.LOVING:
             return { y: baseY - 5, rotate: side === 'left' ? -10 : 10 };
        case Emotion.CONFUSED:
             return { y: baseY - 5, rotate: side === 'left' ? -15 : 20 }; // One up one down-ish
        case Emotion.SKEPTICAL:
             // One raised
             if (side === 'left') return { y: baseY, rotate: 0 };
             return { y: baseY - 10, rotate: 15 };
        case Emotion.TIRED:
             return { y: baseY, rotate: side === 'left' ? -10 : 10 };
        case Emotion.EXCITED:
             return { y: baseY - 15, rotate: side === 'left' ? -20 : 20 };
        default:
            return { y: baseY, rotate: 0 };
    }
  };

  const getMouthShape = () => {
    switch (internalEmotion) {
      case Emotion.HAPPY:
        return { d: "M 35,75 Q 50,85 65,75", strokeWidth: 4 }; // Smile
      case Emotion.SAD:
        return { d: "M 35,80 Q 50,70 65,80", strokeWidth: 4 }; // Frown
      case Emotion.ANGRY:
        return { d: "M 40,80 L 60,80", strokeWidth: 3 }; // Straight line
      case Emotion.SURPRISED:
        return { d: "M 45,75 Q 50,75 55,75 A 5 5 0 1 0 45,75", strokeWidth: 4 }; // Small O (simulated with path or circle) -- actually let's just use ellipse for O mouth
      case Emotion.THINKING:
        return { d: "M 40,80 L 60,80", strokeWidth: 3 }; // Flat
      case Emotion.LOVING:
        return { d: "M 35,75 Q 50,85 65,75", strokeWidth: 4 }; // Smile
      case Emotion.CONFUSED:
        return { d: "M 40,80 Q 50,75 60,82", strokeWidth: 3 }; // Squiggly? or just uneven
      case Emotion.SKEPTICAL:
        return { d: "M 40,80 L 60,78", strokeWidth: 3 }; // Slanted line
      case Emotion.TIRED:
        return { d: "M 45,85 A 5 5 0 1 1 55 85", strokeWidth: 3 }; // Small O (yawn)
      case Emotion.EXCITED:
         return { d: "M 35,75 Q 50,95 65,75", strokeWidth: 5 }; // Big Smile
      default:
        return { d: "M 35,78 L 65,78", strokeWidth: 4 }; // Neutral line
    }
  };

  const leftEye = getEyeShape('left');
  const rightEye = getEyeShape('right');
  const leftBrow = getEyebrowShape('left');
  const rightBrow = getEyebrowShape('right');
  const mouth = getMouthShape();

  // Color logic
  const getColor = () => {
      switch(internalEmotion) {
          case Emotion.ANGRY: return "#ff4444"; // Red
          case Emotion.HAPPY: return "#44ff44"; // Greenish
          case Emotion.SAD: return "#4488ff"; // Blueish
          case Emotion.THINKING: return "#ffff44"; // Yellow
          case Emotion.SURPRISED: return "#ffcc00"; // Orange-ish
          case Emotion.LOVING: return "#ff69b4"; // Pink
          case Emotion.CONFUSED: return "#da70d6"; // Orchid
          case Emotion.SKEPTICAL: return "#ffa500"; // Orange
          case Emotion.TIRED: return "#a9a9a9"; // Grey
          case Emotion.EXCITED: return "#00ffff"; // Cyan Bright
          default: return "#ccffff"; // Cyan/White
      }
  }

  const color = getColor();
  const glowId = "glow-filter";

  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      <svg
        viewBox="0 0 100 100"
        className="w-[80vmin] h-[80vmin] max-w-[600px] max-h-[600px] transition-all duration-500"
        style={{ filter: `drop-shadow(0 0 10px ${color})` }}
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Eyebrow */}
        <rect
             x="25" y={leftBrow.y} width="20" height="3" rx="1.5"
             fill={color}
             className="transition-all duration-500 ease-out"
             transform={`rotate(${leftBrow.rotate}, 35, ${leftBrow.y})`}
        />

        {/* Right Eyebrow */}
        <rect
             x="55" y={rightBrow.y} width="20" height="3" rx="1.5"
             fill={color}
             className="transition-all duration-500 ease-out"
             transform={`rotate(${rightBrow.rotate}, 65, ${rightBrow.y})`}
        />

        {/* Left Eye */}
        <rect
          x="28" // Center around 35
          y={leftEye.y - (leftEye.height / 2)}
          width="14"
          height={leftEye.height}
          rx="4"
          fill={color}
          className="transition-all duration-200 ease-out"
          transform={`rotate(${leftEye.rotate || 0}, 35, 40)`}
        />

        {/* Right Eye */}
        <rect
          x="58" // Center around 65
          y={rightEye.y - (rightEye.height / 2)}
          width="14"
          height={rightEye.height}
          rx="4"
          fill={color}
          className="transition-all duration-200 ease-out"
          transform={`rotate(${rightEye.rotate || 0}, 65, 40)`}
        />

        {/* Mouth */}
        {internalEmotion === Emotion.SURPRISED ? (
             <ellipse 
                cx="50" cy="80" rx="6" ry="8" 
                fill="none" stroke={color} strokeWidth="3"
                className="transition-all duration-500 ease-out"
             />
        ) : (
            <path
            d={mouth.d}
            stroke={color}
            strokeWidth={mouth.strokeWidth}
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            />
        )}
        
        {/* Scanlines effect overlay (optional, subtle) */}
        <pattern id="scanlines" x="0" y="0" width="100" height="2" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="100" height="1" fill="black" opacity="0.1" />
        </pattern>
        <rect x="0" y="0" width="100" height="100" fill="url(#scanlines)" style={{ mixBlendMode: 'overlay' }} />

      </svg>
    </div>
  );
};

export default RobotFace;