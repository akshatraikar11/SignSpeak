import React, { useState, useEffect, useRef, useCallback } from 'react';
import HandTracker from './HandTracker';
import SignGuide from './SignGuide';
import UserAuth from './UserAuth';
import SignInPrompt from './SignInPrompt';
import { addSignToBuffer, clearSignBuffer, textToSignGuidance } from '../services/geminiService';
import { SIGN_LIBRARY } from '../config/signs';
import { onAuthChange, saveTranslation, getUserTranslations, signInWithGoogle } from '../config/firebase.config';
import '../styles/Translator.css';
import '../styles/UserAuth.css';

const Translator = () => {
    const [activeTab, setActiveTab] = useState('sign-to-text'); // 'sign-to-text' or 'text-to-sign'
    const [detectedSigns, setDetectedSigns] = useState([]);
    const [translation, setTranslation] = useState('');
    const [handsCount, setHandsCount] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Camera view mode
    const [showFullVideo, setShowFullVideo] = useState(false);

    // Firebase Auth state
    const [user, setUser] = useState(null);
    const [translationHistory, setTranslationHistory] = useState([]);

    // Sign-in prompt state
    const [showSignInPrompt, setShowSignInPrompt] = useState(false);

    // Text to Sign state
    const [inputText, setInputText] = useState('');
    const [signSequence, setSignSequence] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const speechSynthRef = useRef(null);

    const speakText = useCallback((text) => {
        // Cancel any ongoing speech
        if (speechSynthRef.current) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    // Firebase Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthChange(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Load user's translation history
                const history = await getUserTranslations(currentUser.uid);
                setTranslationHistory(history);
            } else {
                setTranslationHistory([]);

                // Show sign-in prompt if not signed in (shows every time until user signs in or clicks continue)
                setTimeout(() => setShowSignInPrompt(true), 1500); // Show after 1.5 seconds
            }
        });

        return () => unsubscribe();
    }, []);

    const handleTranslation = useCallback((result) => {
        if (result.success) {
            setTranslation(result.translation);
            speakText(result.translation);

            // Keep showing the translated signs
            if (result.displaySigns) {
                setDetectedSigns(result.displaySigns);
            }

            // Save to Firestore if user is signed in
            if (user) {
                saveTranslation(user.uid, {
                    signs: result.originalSigns,
                    translation: result.translation,
                    method: result.method || 'direct'
                }).then(() => {
                    // Reload history
                    getUserTranslations(user.uid).then(setTranslationHistory);
                }).catch(console.error);
            }
        } else {
            setTranslation(result.translation || result.originalSigns?.join(' '));
        }
    }, [user, speakText, setTranslationHistory]);

    const handleSignDetected = useCallback((signData) => {
        // Add to buffer with direct translation (no Gemini = no lag)
        const currentBuffer = addSignToBuffer(signData.sign, handleTranslation, false);

        // Only update state if buffer actually changed (prevents unnecessary re-renders)
        setDetectedSigns(prev => {
            if (JSON.stringify(prev) === JSON.stringify(currentBuffer)) {
                return prev; // No change, don't trigger re-render
            }
            return currentBuffer;
        });
    }, [handleTranslation]);

    const handleHandsDetected = useCallback((count) => {
        setHandsCount(count);
    }, []);

    const handleClear = () => {
        clearSignBuffer();
        setDetectedSigns([]);
        setTranslation('');
        window.speechSynthesis.cancel();
    };

    const handleTextToSign = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setSignSequence([]);

        try {
            const result = await textToSignGuidance(inputText);
            if (result.success && result.signs.length > 0) {
                setSignSequence(result.signs);
            } else {
                alert('Could not convert text to signs. Please try a simpler phrase.');
            }
        } catch (error) {
            console.error('Text to sign error:', error);
            alert('An error occurred. Please check your internet connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearTextToSign = () => {
        setInputText('');
        setSignSequence([]);
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            window.speechSynthesis.cancel();
            clearSignBuffer();
        };
    }, []);

    return (
        <div className="translator-container">
            {/* Sign-in prompt modal */}
            {showSignInPrompt && (
                <SignInPrompt
                    onSignIn={async () => {
                        await signInWithGoogle();
                        setShowSignInPrompt(false);
                    }}
                    onContinue={() => setShowSignInPrompt(false)}
                    onClose={() => setShowSignInPrompt(false)}
                />
            )}

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'sign-to-text' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sign-to-text')}
                >
                    🤟 Sign to Text
                </button>
                <button
                    className={`tab-btn ${activeTab === 'text-to-sign' ? 'active' : ''}`}
                    onClick={() => setActiveTab('text-to-sign')}
                >
                    ✍️ Text to Sign
                </button>
            </div>

            <div className="translator-main">
                {/* SIGN TO TEXT MODE */}
                {activeTab === 'sign-to-text' && (
                    <>
                        {/* Camera Feed */}
                        <div className="camera-section">
                            <div className="camera-controls">
                                <button
                                    className="btn-toggle-view"
                                    onClick={() => setShowFullVideo(!showFullVideo)}
                                >
                                    {showFullVideo ? '👁️ Hands Only' : '📹 Full Camera'}
                                </button>
                            </div>

                            <HandTracker
                                onSignDetected={handleSignDetected}
                                onHandsDetected={handleHandsDetected}
                                showFullVideo={showFullVideo}
                            />

                            <div className="camera-status">
                                <div className={`status-indicator ${handsCount > 0 ? 'active' : ''}`}>
                                    {handsCount > 0 ? `${handsCount} hand${handsCount > 1 ? 's' : ''} detected` : 'No hands detected'}
                                </div>
                            </div>
                        </div>

                        {/* Translation Output */}
                        <div className="translation-section">
                            {/* Detected Signs Buffer */}
                            <div className="signs-buffer">
                                <h3>Detected Signs</h3>
                                <div className="signs-list">
                                    {detectedSigns.length > 0 ? (
                                        detectedSigns.map((sign, index) => (
                                            <span key={index} className="sign-pill">
                                                {sign}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="placeholder">Signs will appear here as you sign...</span>
                                    )}
                                </div>
                            </div>

                            {/* Translation Output */}
                            <div className="translation-output">
                                <div className="output-header">
                                    <h3>Translation</h3>
                                    {isSpeaking && <span className="speaking-indicator">🔊 Speaking...</span>}
                                </div>

                                <div className="translation-text">
                                    {translation || 'Your translation will appear here...'}
                                </div>

                                {translation && (
                                    <div className="translation-controls">
                                        <button
                                            className="btn-speak"
                                            onClick={() => speakText(translation)}
                                            disabled={isSpeaking}
                                        >
                                            🔊 Speak Again
                                        </button>
                                        <button
                                            className="btn-clear"
                                            onClick={handleClear}
                                        >
                                            🗑️ Clear
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="instructions">
                                <h4>How to Use</h4>
                                <ol>
                                    <li>Allow camera access when prompted</li>
                                    <li>Position your hand in front of the camera</li>
                                    <li>Make ASL signs clearly</li>
                                    <li>Watch the translation appear in real-time</li>
                                    <li>Click "Speak" to hear the translation</li>
                                </ol>
                                <div className="tip">
                                    💡 <strong>Tip:</strong> Hold each sign steady for best recognition
                                </div>
                            </div>

                            {/* Translation History */}
                            {!user && (
                                <div className="sign-in-prompt">
                                    <p>🔐 Sign in to save your translation history!</p>
                                </div>
                            )}

                            {user && translationHistory.length > 0 && (
                                <div className="translation-history">
                                    <h4>Recent Translations</h4>
                                    <div className="history-list">
                                        {translationHistory.slice(0, 5).map((item, index) => (
                                            <div key={item.id || index} className="history-item">
                                                <div className="history-signs">
                                                    {item.signs?.join(' → ') || 'N/A'}
                                                </div>
                                                <div className="history-translation">
                                                    {item.translation}
                                                </div>
                                                <div className="history-time">
                                                    {item.timestamp?.toDate?.().toLocaleString() || 'Just now'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* TEXT TO SIGN MODE */}
                {activeTab === 'text-to-sign' && (
                    <div className="text-to-sign-section">
                        <div className="text-input-area">
                            <h3>Enter Text to Convert to ASL Signs</h3>
                            <textarea
                                className="text-input"
                                placeholder="Type a sentence or phrase... (e.g., 'Hello, how are you?')"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={4}
                            />
                            <div className="text-controls">
                                <button
                                    className="btn-convert"
                                    onClick={handleTextToSign}
                                    disabled={!inputText.trim() || isLoading}
                                >
                                    {isLoading ? '🔄 Converting...' : '✨ Convert to Signs'}
                                </button>
                                <button
                                    className="btn-clear"
                                    onClick={clearTextToSign}
                                    disabled={!inputText && signSequence.length === 0}
                                >
                                    🗑️ Clear
                                </button>
                            </div>
                        </div>

                        {/* Sign Sequence Display */}
                        {signSequence.length > 0 && (
                            <div className="sign-sequence-display">
                                <h3>Sign This Sequence:</h3>
                                <div className="sign-sequence-list">
                                    {signSequence.map((signName, index) => {
                                        const signInfo = Object.values(SIGN_LIBRARY).find(
                                            s => s.name.toUpperCase() === signName.toUpperCase()
                                        );

                                        return (
                                            <div key={index} className="sign-sequence-card">
                                                <div className="sequence-number">{index + 1}</div>
                                                <div className="sign-name">{signName}</div>
                                                {signInfo && (
                                                    <div className="sign-description">{signInfo.description}</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="sequence-tip">
                                    💡 <strong>Tip:</strong> Perform these signs in order. Check the Sign Guide for detailed instructions!
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="instructions">
                            <h4>How to Use</h4>
                            <ol>
                                <li>Type any English sentence or phrase</li>
                                <li>Click "Convert to Signs"</li>
                                <li>Follow the sign sequence shown</li>
                                <li>Use the Sign Guide for detailed instructions</li>
                            </ol>

                            <div className="tip">
                                🤖 <strong>Powered by Gemini AI:</strong> Converts your text into proper ASL grammar
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="info-banner">
                <p>
                    <strong>Powered by:</strong> MediaPipe Hands (Google) • Web Speech API
                </p>
            </div>

            {/* Sign Guide */}
            <SignGuide />
        </div>
    );
};

export default Translator;
