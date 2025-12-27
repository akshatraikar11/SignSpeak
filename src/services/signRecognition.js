import { SIGN_LIBRARY } from '../config/signs';

/**
 * Sign Recognition Engine
 * Recognizes ASL signs from MediaPipe hand landmarks
 */

// Calculate distance between two points
const distance = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Check if fingers are extended
const isFingerExtended = (landmarks, fingerTipIndex, fingerMcpIndex) => {
    const tip = landmarks[fingerTipIndex];
    const mcp = landmarks[fingerMcpIndex];
    const wrist = landmarks[0];

    // Finger is extended if tip is farther from wrist than mcp
    return distance(tip, wrist) > distance(mcp, wrist);
};

/**
 * Extract hand features from landmarks
 */
export const extractHandFeatures = (landmarks) => {
    if (!landmarks || landmarks.length !== 21) {
        return null;
    }

    // Landmark indices (MediaPipe Hands)
    const WRIST = 0;
    const THUMB_TIP = 4, THUMB_MCP = 2;
    const INDEX_TIP = 8, INDEX_MCP = 5;
    const MIDDLE_TIP = 12, MIDDLE_MCP = 9;
    const RING_TIP = 16, RING_MCP = 13;
    const PINKY_TIP = 20, PINKY_MCP = 17;

    return {
        // Finger extension states
        thumbExtended: isFingerExtended(landmarks, THUMB_TIP, THUMB_MCP),
        indexExtended: isFingerExtended(landmarks, INDEX_TIP, INDEX_MCP),
        middleExtended: isFingerExtended(landmarks, MIDDLE_TIP, MIDDLE_MCP),
        ringExtended: isFingerExtended(landmarks, RING_TIP, RING_MCP),
        pinkyExtended: isFingerExtended(landmarks, PINKY_TIP, PINKY_MCP),

        // Count extended fingers
        extendedCount: [
            isFingerExtended(landmarks, THUMB_TIP, THUMB_MCP),
            isFingerExtended(landmarks, INDEX_TIP, INDEX_MCP),
            isFingerExtended(landmarks, MIDDLE_TIP, MIDDLE_MCP),
            isFingerExtended(landmarks, RING_TIP, RING_MCP),
            isFingerExtended(landmarks, PINKY_TIP, PINKY_MCP)
        ].filter(Boolean).length,

        // Hand position
        palmCenter: landmarks[WRIST],

        // Distances
        thumbIndexDist: distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]),
        indexMiddleDist: distance(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]),

        // Raw landmarks for advanced recognition
        landmarks
    };
};

/**
 * Recognize sign from hand features
 * This is a simplified version - real app would use ML model
 */
export const recognizeSign = (features) => {
    if (!features) {
        return { sign: null, confidence: 0 };
    }

    const { extendedCount, thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended } = features;

    // FIST / CLOSED HAND - Priority check first
    if (extendedCount === 0) {
        return { sign: 'STOP', name: 'Stop', confidence: 0.85 };
    }

    // THUMBS UP - Only thumb extended
    if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return { sign: 'YES', name: 'Yes', confidence: 0.9 };
    }

    // ONE FINGER - Only index
    if (!thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return { sign: 'ONE', name: 'One (1)', confidence: 0.85 };
    }

    // PEACE SIGN / TWO - Index and middle
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return { sign: 'PEACE', name: 'Peace', confidence: 0.85 };
    }

    // THREE - Thumb, index, and middle
    if (thumbExtended && indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return { sign: 'THREE', name: 'Three (3)', confidence: 0.85 };
    }

    // FOUR - All except thumb
    if (!thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
        return { sign: 'FOUR', name: 'Four (4)', confidence: 0.85 };
    }

    // FIVE / OPEN HAND - All fingers extended
    if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
        return { sign: 'HELLO', name: 'Hello', confidence: 0.85 };
    }

    // Fallback for partial matches
    if (extendedCount === 1 && thumbExtended) {
        return { sign: 'YES', name: 'Yes', confidence: 0.7 };
    }

    if (extendedCount >= 5) {
        return { sign: 'HELLO', name: 'Hello', confidence: 0.7 };
    }

    // Default: Unknown
    return { sign: null, confidence: 0 };
};

/**
 * Temporal smoothing - prevent jitter in recognition
 */
class SignSmoother {
    constructor(windowSize = 3, threshold = 0.4) {  // Lowered threshold for easier detection
        this.window = [];
        this.windowSize = windowSize;
        this.threshold = threshold;
    }

    addSign(sign, confidence) {
        this.window.push({ sign, confidence, timestamp: Date.now() });

        // Keep only recent signs
        if (this.window.length > this.windowSize) {
            this.window.shift();
        }

        // Remove old signs (> 2 seconds)
        const now = Date.now();
        this.window = this.window.filter(item => now - item.timestamp < 2000);
    }

    getStableSign() {
        if (this.window.length === 0) {
            return { sign: null, confidence: 0 };
        }

        // Count occurrences
        const signCounts = {};
        this.window.forEach(item => {
            if (item.sign && item.confidence > 0.5) {
                signCounts[item.sign] = (signCounts[item.sign] || 0) + 1;
            }
        });

        // Find most common sign
        let bestSign = null;
        let bestCount = 0;

        Object.entries(signCounts).forEach(([sign, count]) => {
            if (count > bestCount && count >= this.windowSize * this.threshold) {
                bestSign = sign;
                bestCount = count;
            }
        });

        return {
            sign: bestSign,
            confidence: bestSign ? bestCount / this.windowSize : 0
        };
    }

    reset() {
        this.window = [];
    }
}

export const signSmoother = new SignSmoother();

/**
 * Get sign details from library
 */
export const getSignDetails = (signKey) => {
    return SIGN_LIBRARY[signKey] || null;
};

export default {
    extractHandFeatures,
    recognizeSign,
    getSignDetails,
    signSmoother
};
