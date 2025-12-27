import { genAI, MODELS, generationConfig, safetySettings } from '../config/gemini.config';

// Sign sequence buffer for context-aware translation
let signBuffer = [];
const BUFFER_TIMEOUT = 3000; // 3 seconds - increased to prevent looping
let bufferTimer = null;

/**
 * Translate sign sequence to natural language using Gemini
 * This is the KEY INNOVATION - context-aware translation vs word-by-word
 */
export const translateSignSequence = async (signs) => {
    try {
        const model = genAI.getGenerativeModel({
            model: MODELS.FLASH,
            generationConfig,
            safetySettings
        });

        // Create context-aware prompt
        const prompt = `You are a sign language translator. Convert these American Sign Language (ASL) signs into a natural, grammatically correct English sentence.

Signs detected (in order): ${signs.join(', ')}

Rules:
1. Produce ONE clear, natural sentence
2. Add proper grammar (ASL doesn't have 'is', 'are', etc.)
3. If signs don't form a complete thought, make the best interpretation
4. Keep it concise (under 20 words)
5. Do NOT explain, just translate

Natural English translation:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translation = response.text().trim();

        return {
            success: true,
            translation,
            originalSigns: signs,
            method: 'gemini-context'
        };
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Gemini translation error:', error);
        }

        // Fallback to direct translation
        return {
            success: false,
            translation: signs.join(' '),
            originalSigns: signs,
            method: 'fallback-direct',
            error: error.message
        };
    }
};

/**
 * Add sign to buffer and trigger translation when ready
 */
let lastSignTime = 0;
const MIN_SIGN_INTERVAL = 800; // Minimum 800ms between same signs

export const addSignToBuffer = (signName, callback, useGemini = false) => {
    const now = Date.now();

    // Prevent rapid duplicate detection (same sign within 3 seconds)
    if (signBuffer.length > 0 && signBuffer[signBuffer.length - 1] === signName && now - lastSignTime < 3000) {
        return [...signBuffer]; // Ignore rapid duplicates
    }

    // Don't add consecutive duplicates
    if (signBuffer.length > 0 && signBuffer[signBuffer.length - 1] === signName) {
        return [...signBuffer]; // Return current buffer without adding
    }

    // Add sign to buffer
    signBuffer.push(signName);
    lastSignTime = now;

    // Clear existing timer
    if (bufferTimer) {
        clearTimeout(bufferTimer);
    }

    // Set new timer - translate after pause in signing (4 seconds for better UX)
    bufferTimer = setTimeout(async () => {
        if (signBuffer.length > 0) {
            const signsToTranslate = [...signBuffer]; // Copy buffer
            signBuffer = []; // Clear internal buffer to prevent re-adding

            if (useGemini) {
                // Use Gemini for context-aware translation (may be slow)
                const result = await translateSignSequence(signsToTranslate);
                result.displaySigns = signsToTranslate; // Keep signs visible
                callback(result);
            } else {
                // Direct translation (fast, no AI)
                const translation = signsToTranslate.join(' ');
                callback({
                    success: true,
                    translation,
                    originalSigns: signsToTranslate,
                    displaySigns: signsToTranslate, // Keep signs visible
                    method: 'direct'
                });
            }
        }
    }, 4000); // Increased to 4 seconds

    // Return current buffer for display
    return [...signBuffer];
};

/**
 * Clear sign buffer manually
 */
export const clearSignBuffer = () => {
    signBuffer = [];
    if (bufferTimer) {
        clearTimeout(bufferTimer);
    }
};

/**
 * Get current buffer
 */
export const getSignBuffer = () => [...signBuffer];

/**
 * Analyze hand gesture image using Gemini Vision
 * Used when recognition confidence is low
 */
export const analyzeGestureImage = async (imageData) => {
    try {
        const model = genAI.getGenerativeModel({
            model: MODELS.VISION
        });

        const prompt = `What American Sign Language (ASL) gesture is this person making? 
    
Respond with ONLY the sign name (e.g., "HELLO", "THANK YOU", "YES"). 
If you can't identify it confidently, respond with "UNKNOWN"`;

        const imagePart = {
            inlineData: {
                data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
                mimeType: 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const signName = response.text().trim().toUpperCase();

        return {
            success: true,
            signName,
            confidence: signName !== 'UNKNOWN' ? 0.75 : 0.1,
            method: 'gemini-vision'
        };
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Gemini Vision error:', error);
        }
        return {
            success: false,
            signName: 'UNKNOWN',
            confidence: 0,
            error: error.message
        };
    }
};

/**
 * Get sign explanation/description
 */
export const getSignExplanation = async (signName) => {
    try {
        const model = genAI.getGenerativeModel({
            model: MODELS.FLASH
        });

        const prompt = `Explain how to make the ASL sign for "${signName}" in 1-2 simple sentences. Focus on hand shape and movement.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        return {
            success: true,
            explanation: response.text().trim()
        };
    } catch (error) {
        return {
            success: false,
            explanation: 'Explanation unavailable',
            error: error.message
        };
    }
};

/**
 * Text to sign guidance - help users learn how to sign a phrase
 */
export const textToSignGuidance = async (text) => {
    try {
        // Check if API key is available
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        if (!API_KEY || API_KEY === 'demo') {
            // Fallback: Simple word-based conversion
            console.warn('Gemini API key not configured. Using fallback conversion.');
            const signs = text
                .toUpperCase()
                .replace(/[^\w\s]/g, '') // Remove punctuation
                .split(/\s+/)
                .filter(word => word.length > 0);

            return {
                success: true,
                signs,
                originalText: text,
                method: 'fallback'
            };
        }

        const model = genAI.getGenerativeModel({
            model: MODELS.FLASH
        });

        const prompt = `Convert this English text to ASL signs: "${text}"
    
Respond with ONLY a comma-separated list of ASL signs in the order they should be signed.
Example: "I am happy" → "I, HAPPY"
Example: "What is your name?" → "WHAT, YOUR, NAME"

Signs for: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const signs = response.text().trim().split(',').map(s => s.trim().toUpperCase());

        return {
            success: true,
            signs,
            originalText: text,
            method: 'gemini'
        };
    } catch (error) {
        console.error('Text to sign error:', error);

        // Fallback on error
        const signs = text
            .toUpperCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);

        return {
            success: true,
            signs,
            originalText: text,
            method: 'fallback-error'
        };
    }
};

export default {
    translateSignSequence,
    addSignToBuffer,
    clearSignBuffer,
    getSignBuffer,
    analyzeGestureImage,
    getSignExplanation,
    textToSignGuidance
};
