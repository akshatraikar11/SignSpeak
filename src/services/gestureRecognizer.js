/**
 * MediaPipe Gesture Recognizer Service
 * Uses Google's pre-trained gesture recognition model
 */

import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

let gestureRecognizer = null;
let isInitializing = false;

/**
 * Initialize MediaPipe Gesture Recognizer
 */
export const initializeGestureRecognizer = async () => {
    if (gestureRecognizer) return gestureRecognizer;
    if (isInitializing) {
        // Wait for initialization to complete
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return gestureRecognizer;
    }

    try {
        isInitializing = true;
        console.log('Initializing MediaPipe Gesture Recognizer...');

        // Load MediaPipe vision tasks
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        // Create gesture recognizer with pre-trained model
        gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        console.log('✅ MediaPipe Gesture Recognizer initialized!');
        isInitializing = false;
        return gestureRecognizer;

    } catch (error) {
        console.error('Failed to initialize Gesture Recognizer:', error);
        isInitializing = false;
        return null;
    }
};

/**
 * Recognize gestures from video frame
 */
export const recognizeGestures = async (videoElement, timestamp) => {
    if (!gestureRecognizer) {
        await initializeGestureRecognizer();
    }

    if (!gestureRecognizer || !videoElement) {
        return { gestures: [], landmarks: [] };
    }

    try {
        // Recognize gestures in video frame
        const results = gestureRecognizer.recognizeForVideo(videoElement, timestamp);

        return {
            gestures: results.gestures || [],
            landmarks: results.landmarks || [],
            handedness: results.handednesses || []
        };

    } catch (error) {
        console.error('Gesture recognition error:', error);
        return { gestures: [], landmarks: [] };
    }
};

/**
 * Map MediaPipe gesture names to our sign names
 */
const GESTURE_TO_SIGN_MAP = {
    // MediaPipe built-in gestures
    'Thumb_Up': 'YES',
    'Victory': 'PEACE',
    'Open_Palm': 'HELLO',
    'Closed_Fist': 'STOP',
    'Pointing_Up': '1',
    'ILoveYou': 'LOVE',

    // Additional mappings
    'Thumb_Down': 'NO',
    'Open_Hand': '5'
};

/**
 * Get sign name from MediaPipe gesture
 */
export const mapGestureToSign = (gestureName, confidence) => {
    const signName = GESTURE_TO_SIGN_MAP[gestureName];

    if (signName) {
        return {
            sign: signName,
            confidence: confidence,
            method: 'mediapipe-ai'
        };
    }

    return null;
};

/**
 * Process gesture recognition results
 */
export const processGestureResults = (results) => {
    if (!results.gestures || results.gestures.length === 0) {
        return null;
    }

    // Get first hand's gesture
    const handGestures = results.gestures[0];
    if (!handGestures || handGestures.length === 0) {
        return null;
    }

    // Get top gesture
    const topGesture = handGestures[0];
    const handedness = results.handedness?.[0]?.[0]?.categoryName || 'Unknown';

    // Map to our sign
    const signResult = mapGestureToSign(topGesture.categoryName, topGesture.score);

    if (signResult && signResult.confidence > 0.7) {
        return {
            ...signResult,
            handedness,
            gestureName: topGesture.categoryName
        };
    }

    return null;
};

/**
 * Get list of supported gestures
 */
export const getSupportedGestures = () => {
    return Object.keys(GESTURE_TO_SIGN_MAP);
};

export default {
    initializeGestureRecognizer,
    recognizeGestures,
    processGestureResults,
    mapGestureToSign,
    getSupportedGestures
};
