export enum Emotion {
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  SURPRISED = 'SURPRISED',
  THINKING = 'THINKING',
  LOVING = 'LOVING',
  CONFUSED = 'CONFUSED',
  SKEPTICAL = 'SKEPTICAL',
  TIRED = 'TIRED',
  EXCITED = 'EXCITED',
  BLINK = 'BLINK', // Internal state, not from API
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface BotResponse {
  text: string;
  emotion: Emotion;
}
