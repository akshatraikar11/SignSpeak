import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in .env file');
}

export const genAI = new GoogleGenerativeAI(API_KEY || 'demo');

// Model configurations
export const MODELS = {
  FLASH: 'gemini-1.5-flash', // Fast, real-time translation
  PRO: 'gemini-1.5-pro',     // More accurate, slower
  VISION: 'gemini-1.5-flash' // For image analysis
};

// Generation config for optimal performance
export const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 150, // Keep responses concise
};

// Safety settings (allow all content for accessibility app)
export const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
];
