/**
 * Simplified ASL Classifier - Quality over Quantity
 * Focuses on 12 reliable signs that work well with heuristic detection
 */

import * as tf from '@tensorflow/tfjs';

// Reliable signs we can actually detect accurately
const RELIABLE_SIGNS = [
    // Numbers (5 signs)
    '1', '2', '3', '4', '5',
    // Common gestures (7 signs)
    'YES', 'HELLO', 'STOP', 'PEACE', 'LOVE', 'L', 'Y'
];

/**
 * Simplified heuristic-based ASL recognition
 * Only detects signs we can recognize reliably
 */
const detectReliableSign = (landmarks) => {
    // Helper functions
    const distance = (p1, p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = (p1.z || 0) - (p2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    const isFingerExtended = (tipIdx, mcpIdx) => {
        const tip = landmarks[tipIdx];
        const mcp = landmarks[mcpIdx];
        const wrist = landmarks[0];
        return distance(tip, wrist) > distance(mcp, wrist);
    };

    // Finger indices
    const THUMB_TIP = 4, THUMB_MCP = 2;
    const INDEX_TIP = 8, INDEX_MCP = 5;
    const MIDDLE_TIP = 12, MIDDLE_MCP = 9;
    const RING_TIP = 16, RING_MCP = 13;
    const PINKY_TIP = 20, PINKY_MCP = 17;

    const thumbExt = isFingerExtended(THUMB_TIP, THUMB_MCP);
    const indexExt = isFingerExtended(INDEX_TIP, INDEX_MCP);
    const middleExt = isFingerExtended(MIDDLE_TIP, MIDDLE_MCP);
    const ringExt = isFingerExtended(RING_TIP, RING_MCP);
    const pinkyExt = isFingerExtended(PINKY_TIP, PINKY_MCP);

    const extendedCount = [thumbExt, indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

    // ===== RELIABLE SIGN DETECTION =====

    // STOP - Closed fist
    if (extendedCount === 0) {
        return { sign: 'STOP', confidence: 0.90 };
    }

    // YES - Thumbs up (with strict validation)
    if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) {
        const thumbTip = landmarks[THUMB_TIP];
        const wrist = landmarks[0];
        // Thumb must be significantly above wrist
        if (thumbTip.y < wrist.y - 0.12) {
            return { sign: 'YES', confidence: 0.95 };
        }
    }

    // 1 - Index finger only
    if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
        return { sign: '1', confidence: 0.92 };
    }

    // 2 or PEACE - Index and middle
    if (!thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) {
        const indexTip = landmarks[INDEX_TIP];
        const middleTip = landmarks[MIDDLE_TIP];
        const separation = distance(indexTip, middleTip);

        if (separation > 0.09) {
            return { sign: 'PEACE', confidence: 0.93 };
        }
        return { sign: '2', confidence: 0.90 };
    }

    // 3 - Thumb, index, middle
    if (thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) {
        return { sign: '3', confidence: 0.92 };
    }

    // 4 - Four fingers (no thumb)
    if (!thumbExt && indexExt && middleExt && ringExt && pinkyExt) {
        return { sign: '4', confidence: 0.92 };
    }

    // 5 or HELLO - All fingers extended (must have ALL 5 fingers)
    if (thumbExt && indexExt && middleExt && ringExt && pinkyExt) {
        const palmY = landmarks[0].y;
        const middleY = landmarks[MIDDLE_TIP].y;

        // HELLO if hand is raised (fingers pointing up)
        if (middleY < palmY - 0.15) {
            return { sign: 'HELLO', confidence: 0.91 };
        }
        return { sign: '5', confidence: 0.90 };
    }

    // L - Thumb and index in L shape
    if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
        const thumbTip = landmarks[THUMB_TIP];
        const indexTip = landmarks[INDEX_TIP];
        const angle = Math.abs(thumbTip.x - indexTip.x);

        if (angle > 0.12) {
            return { sign: 'L', confidence: 0.90 };
        }
    }

    // LOVE - Index and pinky extended (I Love You sign)
    if (!thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) {
        return { sign: 'LOVE', confidence: 0.90 };
    }

    // Y - Thumb and pinky extended
    if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
        return { sign: 'Y', confidence: 0.90 };
    }

    // NO - Thumb only extended pointing down
    if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) {
        const thumbTip = landmarks[THUMB_TIP];
        const wrist = landmarks[0];
        const thumbBase = landmarks[2];

        // Thumb pointing significantly downward
        if (thumbTip.y > thumbBase.y + 0.05 && thumbTip.y > wrist.y + 0.08) {
            return { sign: 'NO', confidence: 0.88 };
        }
    }

    // No reliable match
    return { sign: null, confidence: 0 };
};

/**
 * Classify ASL sign from MediaPipe hand landmarks
 * Simplified to only return reliable detections
 */
export const classifyASLSign = async (landmarks, handedness = 'Right') => {
    if (!landmarks || landmarks.length !== 21) {
        return { sign: null, confidence: 0, method: 'none' };
    }

    try {
        const result = detectReliableSign(landmarks);

        // Only return if confidence is very high (85%+)
        if (result.sign && result.confidence >= 0.85) {
            return {
                sign: result.sign,
                confidence: result.confidence,
                method: 'heuristic',
                handedness
            };
        }

        return { sign: null, confidence: 0, method: 'none' };

    } catch (error) {
        console.error('ASL classification error:', error);
        return { sign: null, confidence: 0, method: 'error' };
    }
};

/**
 * Get all supported ASL signs
 */
export const getSupportedSigns = () => {
    return RELIABLE_SIGNS;
};

/**
 * Initialize the classifier (call on app start)
 */
export const initializeASLClassifier = async () => {
    try {
        await tf.ready();
        console.log('TensorFlow.js ready (using heuristic detection)');
        return true;
    } catch (error) {
        console.error('Failed to initialize TensorFlow.js:', error);
        return false;
    }
};

export default {
    classifyASLSign,
    getSupportedSigns,
    initializeASLClassifier
};
