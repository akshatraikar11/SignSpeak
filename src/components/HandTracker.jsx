import React, { useRef, useEffect, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { initializeGestureRecognizer, recognizeGestures, processGestureResults } from '../services/gestureRecognizer';  // MediaPipe AI
import { classifyASLSign, initializeASLClassifier } from '../services/aslClassifier';  // Fallback
import { recognizeSign, extractHandFeatures } from '../services/signRecognition';  // Legacy fallback
import { estimateGesture } from '../services/aslModel';  // Fingerpose fallback
import LoadingScreen from './LoadingScreen';

const HandTracker = ({ onSignDetected, onHandsDetected, showFullVideo = false }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fps, setFps] = useState(0);

    const handsRef = useRef(null);
    const cameraRef = useRef(null);
    const lastFrameTime = useRef(Date.now());
    const lastSignRef = useRef(null); // Track last sign with timestamp

    useEffect(() => {
        let mounted = true;

        const initializeHandTracking = async () => {
            try {
                setIsLoading(true);

                // Initialize MediaPipe Gesture Recognizer (Google's pre-trained AI)
                await initializeGestureRecognizer();

                // Initialize TensorFlow.js for ASL classification (fallback)
                await initializeASLClassifier();

                // Initialize MediaPipe Hands
                const hands = new Hands({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 0, // 0 = LITE model (faster, less accurate but good enough)
                    minDetectionConfidence: 0.5, // Lowered for faster detection
                    minTrackingConfidence: 0.5  // Lowered for smoother tracking
                });
                hands.onResults(onResults);
                handsRef.current = hands;

                // Wait for video element
                if (!videoRef.current) {
                    throw new Error('Video element not found');
                }

                // Initialize camera with lower resolution for performance
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (mounted && videoRef.current && handsRef.current) {
                            await handsRef.current.send({ image: videoRef.current });

                            // Calculate FPS
                            const now = Date.now();
                            const delta = now - lastFrameTime.current;
                            if (delta > 0) {
                                setFps(Math.round(1000 / delta));
                            }
                            lastFrameTime.current = now;
                        }
                    },
                    width: 480,  // Reduced from 640 for better performance
                    height: 360  // Reduced from 480 for better performance
                });

                cameraRef.current = camera;
                await camera.start();

                if (mounted) {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Hand tracking initialization error:', err);
                if (mounted) {
                    setError(err.message);
                    setIsLoading(false);
                }
            }
        };

        const onResults = async (results) => {
            if (!mounted || !canvasRef.current || !videoRef.current) return;

            const canvasCtx = canvasRef.current.getContext('2d');
            const { videoWidth, videoHeight } = videoRef.current;

            // Set canvas size
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            // Clear canvas
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, videoWidth, videoHeight);

            // Conditionally draw video frame based on showFullVideo prop
            if (showFullVideo) {
                canvasCtx.drawImage(results.image, 0, 0, videoWidth, videoHeight);
            }

            // Count hands
            const handCount = results.multiHandLandmarks?.length || 0;
            onHandsDetected?.(handCount);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                // Process each hand individually
                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const handedness = results.multiHandedness[i]?.label || 'Unknown';

                    // Draw hand skeleton (brand colors for cohesive UI)
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                        color: '#00d4ff',  // Cyan (matches brand gradient)
                        lineWidth: 2
                    });
                    drawLandmarks(canvasCtx, landmarks, {
                        color: '#00ff88',  // Green (matches brand gradient)
                        lineWidth: 1,
                        radius: 3
                    });

                    // 🎯 MEDIAPIPE AI GESTURE RECOGNITION (Google's Pre-trained Model)
                    let bestResult = null;
                    let method = '';

                    // Try MediaPipe Gesture Recognizer first (real AI!)
                    try {
                        const gestureResults = await recognizeGestures(videoRef.current, Date.now());
                        const gestureSign = processGestureResults(gestureResults);

                        if (gestureSign && gestureSign.confidence > 0.7) {
                            bestResult = {
                                sign: gestureSign.sign,
                                name: gestureSign.sign,
                                confidence: gestureSign.confidence
                            };
                            method = 'MediaPipe AI';
                        }
                    } catch (error) {
                        console.log('MediaPipe gesture recognition not available, using fallback');
                    }

                    // Fallback to heuristic ASL classifier if MediaPipe didn't detect anything
                    if (!bestResult) {
                        const aslResult = await classifyASLSign(landmarks, handedness);

                        if (aslResult && aslResult.sign && aslResult.confidence >= 0.85) {
                            bestResult = {
                                sign: aslResult.sign,
                                name: aslResult.sign,
                                confidence: aslResult.confidence
                            };
                            method = 'Heuristic';
                        }
                    }

                    if (bestResult && bestResult.confidence >= 0.70) {
                        const now = Date.now();
                        // Allow same sign after 5 seconds
                        if (!lastSignRef.current ||
                            bestResult.sign !== lastSignRef.current.sign ||
                            now - lastSignRef.current.timestamp > 5000) {

                            lastSignRef.current = {
                                sign: bestResult.sign,
                                timestamp: now
                            };

                            onSignDetected?.({
                                sign: bestResult.sign,
                                name: bestResult.name,
                                confidence: bestResult.confidence,
                                handedness,
                                method  // Track which method detected it
                            });
                        }

                        // Draw sign on canvas with method indicator
                        canvasCtx.font = 'bold 32px Arial';
                        canvasCtx.fillStyle = '#00FF88';
                        canvasCtx.strokeStyle = '#000000';
                        canvasCtx.lineWidth = 4;
                        const text = `${bestResult.name} (${Math.round(bestResult.confidence * 100)}%)`;
                        const x = handedness === 'Left' ? 10 : videoWidth - 150;
                        const y = 50 + (i * 50);
                        canvasCtx.strokeText(text, x, y);
                        canvasCtx.fillText(text, x, y);

                        // Show method in smaller text
                        canvasCtx.font = 'bold 14px Arial';
                        canvasCtx.fillStyle = '#FFFFFF';
                        canvasCtx.fillText(method, x, y + 25);
                    }
                }

                onHandsDetected?.(results.multiHandLandmarks.length);
            } else {
                onHandsDetected?.(0);
                // signSmoother.reset(); // This line was removed as signSmoother is not defined in the provided context.
                lastSignRef.current = null;  // Reset to allow fresh detection
            }

            canvasCtx.restore();
        };

        initializeHandTracking();

        return () => {
            mounted = false;
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
            if (handsRef.current) {
                handsRef.current.close();
            }
        };
    }, []);  // Empty dependencies - only initialize once

    if (error) {
        return (
            <div className="hand-tracker-error">
                <div className="error-icon">⚠️</div>
                <h3>Camera Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="hand-tracker">
            {isLoading && <LoadingScreen message="Initializing AI Model..." />}

            <div className="video-container">
                <video
                    ref={videoRef}
                    style={{
                        display: showFullVideo ? 'block' : 'none',
                        width: '100%',
                        transform: 'scaleX(-1)'
                    }}
                />
                <canvas
                    ref={canvasRef}
                    className="output-canvas"
                />

                {/* FPS indicator (dev only) */}
                {import.meta.env.DEV && (
                    <div className="fps-indicator" style={{ opacity: 0.6, fontSize: '11px' }}>
                        {fps} FPS
                    </div>
                )}
            </div>
        </div>
    );
};

export default HandTracker;
