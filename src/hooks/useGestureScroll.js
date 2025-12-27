import { useState, useEffect, useRef, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const useGestureScroll = (enabled = false) => {
    const [isActive, setIsActive] = useState(false);
    const [currentGesture, setCurrentGesture] = useState(null);
    const [error, setError] = useState(null);

    const videoRef = useRef(null);
    const handsRef = useRef(null);
    const cameraRef = useRef(null);
    const lastScrollTime = useRef(0);
    const lastHandY = useRef(null);
    const scrollVelocity = useRef(0);

    // Detect if hand is open palm pointing UP (fingers pointing up)
    const isOpenPalmUp = (landmarks) => {
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        // All fingertips should be above their respective knuckles (extended)
        const allExtended =
            indexTip.y < landmarks[6].y &&
            middleTip.y < landmarks[10].y &&
            ringTip.y < landmarks[14].y &&
            pinkyTip.y < landmarks[18].y;

        // Fingertips should be above wrist (palm pointing up)
        const palmUp =
            indexTip.y < wrist.y &&
            middleTip.y < wrist.y &&
            ringTip.y < wrist.y &&
            pinkyTip.y < wrist.y;

        return allExtended && palmUp;
    };

    // Detect if hand is open palm pointing DOWN (fingers pointing down)
    const isOpenPalmDown = (landmarks) => {
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        // All fingertips should be below their respective knuckles (extended downward)
        const allExtended =
            indexTip.y > landmarks[6].y &&
            middleTip.y > landmarks[10].y &&
            ringTip.y > landmarks[14].y &&
            pinkyTip.y > landmarks[18].y;

        // Fingertips should be below wrist (palm pointing down)
        const palmDown =
            indexTip.y > wrist.y &&
            middleTip.y > wrist.y &&
            ringTip.y > wrist.y &&
            pinkyTip.y > wrist.y;

        return allExtended && palmDown;
    };

    const onResults = useCallback((results) => {
        if (!enabled || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            setCurrentGesture(null);
            lastHandY.current = null;
            scrollVelocity.current = 0;
            return;
        }

        const landmarks = results.multiHandLandmarks[0]; // Use first hand
        const now = Date.now();

        // Check for palm up/down gestures only
        if (isOpenPalmUp(landmarks)) {
            // Open palm pointing UP - scroll up
            setCurrentGesture('🖐️ Palm Up - Scrolling Up');
            if (now - lastScrollTime.current > 100) { // Faster response
                window.scrollBy({ top: -20, behavior: 'auto' }); // Continuous smooth scroll
                lastScrollTime.current = now;
            }
        } else if (isOpenPalmDown(landmarks)) {
            // Open palm pointing DOWN - scroll down
            setCurrentGesture('🖐️ Palm Down - Scrolling Down');
            if (now - lastScrollTime.current > 100) { // Faster response
                window.scrollBy({ top: 20, behavior: 'auto' }); // Continuous smooth scroll
                lastScrollTime.current = now;
            }
        } else {
            setCurrentGesture('🤚 Hand Detected');
            lastHandY.current = null;
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) {
            setIsActive(false);
            setCurrentGesture(null);

            // Cleanup camera
            if (cameraRef.current) {
                try {
                    cameraRef.current.stop();
                } catch (e) {
                    console.warn('Error stopping camera:', e);
                }
                cameraRef.current = null;
            }

            // Cleanup hands
            if (handsRef.current) {
                try {
                    handsRef.current.close();
                } catch (e) {
                    console.warn('Error closing hands:', e);
                }
                handsRef.current = null;
            }

            // Cleanup video element
            if (videoRef.current && videoRef.current.parentNode) {
                try {
                    videoRef.current.parentNode.removeChild(videoRef.current);
                } catch (e) {
                    console.warn('Error removing video element:', e);
                }
                videoRef.current = null;
            }

            return;
        }

        let mounted = true;

        const initializeGestureTracking = async () => {
            try {
                // Create video element
                const video = document.createElement('video');
                video.style.display = 'none';
                document.body.appendChild(video);
                videoRef.current = video;

                // Initialize MediaPipe Hands
                const hands = new Hands({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 0, // Lighter model for scrolling
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.7
                });

                hands.onResults(onResults);
                handsRef.current = hands;

                // Initialize camera
                const camera = new Camera(video, {
                    onFrame: async () => {
                        if (mounted && videoRef.current && handsRef.current) {
                            await handsRef.current.send({ image: videoRef.current });
                        }
                    },
                    width: 320,  // Lower resolution for performance
                    height: 240
                });

                cameraRef.current = camera;
                await camera.start();

                if (mounted) {
                    setIsActive(true);
                    setError(null);
                }
            } catch (err) {
                console.error('Gesture tracking initialization error:', err);
                if (mounted) {
                    setError(err.message);
                    setIsActive(false);
                }
            }
        };

        initializeGestureTracking();

        return () => {
            mounted = false;

            // Cleanup camera
            if (cameraRef.current) {
                try {
                    cameraRef.current.stop();
                } catch (e) {
                    console.warn('Cleanup: Error stopping camera:', e);
                }
            }

            // Cleanup hands
            if (handsRef.current) {
                try {
                    handsRef.current.close();
                } catch (e) {
                    console.warn('Cleanup: Error closing hands:', e);
                }
            }

            // Cleanup video element
            if (videoRef.current && videoRef.current.parentNode) {
                try {
                    videoRef.current.parentNode.removeChild(videoRef.current);
                } catch (e) {
                    console.warn('Cleanup: Error removing video:', e);
                }
            }
        };
    }, [enabled, onResults]);

    return {
        isActive,
        currentGesture,
        error,
        videoRef
    };
};

export default useGestureScroll;
