import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGestureScroll from '../hooks/useGestureScroll';
import '../styles/LandingPage.css';
import '../styles/GestureScroll.css';
import '../styles/TechSubtitle.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [gestureEnabled, setGestureEnabled] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    const { isActive, currentGesture, error } = useGestureScroll(gestureEnabled);

    const toggleGestureScroll = () => {
        if (!gestureEnabled) {
            setShowInstructions(true);
        } else {
            setGestureEnabled(false);
        }
    };

    const startGestureScroll = () => {
        setShowInstructions(false);
        setGestureEnabled(true);
    };

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-background"></div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        🤟 Sign<span className="gradient-text">Speak</span>
                    </h1>
                    <p className="hero-subtitle">
                        Breaking Barriers, Building Bridges
                    </p>
                    <p className="hero-description">
                        Real-time AI-powered sign language translation for seamless communication
                    </p>
                    <button className="cta-button" onClick={() => navigate('/translator')}>
                        Start Translating →
                    </button>
                </div>

                <div className="scroll-indicator">
                    <span>↓</span>
                </div>
            </div>

            {/* Problem Statement */}
            <section className="section problem-section">
                <div className="container">
                    <h2>The Problem</h2>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon">🌍</div>
                            <h3>70 Million+ People</h3>
                            <p>Worldwide use sign language as their primary means of communication</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">💼</div>
                            <h3>Employment Barriers</h3>
                            <p>Deaf individuals face significant challenges in workplace communication</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">🚫</div>
                            <h3>Communication Gap</h3>
                            <p>Most people don't understand sign language, creating isolation</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">🎓</div>
                            <h3>Education Access</h3>
                            <p>Limited accessibility to interpreters and translation services</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="section solution-section">
                <div className="container">
                    <h2>Our Solution</h2>
                    <p className="section-subtitle">
                        AI-powered, real-time sign language translation that understands context
                    </p>

                    <div className="solution-steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Hand Tracking</h3>
                                <p>MediaPipe Hands detects and tracks hand movements in real-time</p>
                            </div>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Sign Recognition</h3>
                                <p>AI recognizes ASL signs with high accuracy</p>
                            </div>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Context Translation</h3>
                                <p>Gemini AI translates to natural, grammatically correct sentences</p>
                            </div>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3>Voice Output</h3>
                                <p>Text-to-speech speaks the translation aloud</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section features-section">
                <div className="container">
                    <h2>Key Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Real-Time Translation</h3>
                            <p>Instant recognition and translation with &lt; 1 second latency</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🧠</div>
                            <h3>Context-Aware AI</h3>
                            <p>Gemini understands context for natural, grammatical translations</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎙️</div>
                            <h3>Voice Output</h3>
                            <p>Automatic text-to-speech for hands-free communication</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💰</div>
                            <h3>100% Free</h3>
                            <p>No subscriptions, no hidden costs - accessible to everyone</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌐</div>
                            <h3>Web-Based</h3>
                            <p>Works in any modern browser - no app installation needed</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">♿</div>
                            <h3>Accessibility First</h3>
                            <p>Designed with and for the deaf and hard-of-hearing community</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="section impact-section">
                <div className="container">
                    <h2>Real-World Impact</h2>
                    <div className="impact-stats">
                        <div className="stat">
                            <h3>70M+</h3>
                            <p>Deaf people worldwide who can benefit</p>
                        </div>
                        <div className="stat">
                            <h3>24/7</h3>
                            <p>Always available - no interpreter needed</p>
                        </div>
                        <div className="stat">
                            <h3>$0</h3>
                            <p>Completely free for everyone</p>
                        </div>
                    </div>

                    <div className="use-cases">
                        <h3>Use Cases</h3>
                        <div className="use-cases-grid">
                            <div className="use-case">💼 Workplace communication</div>
                            <div className="use-case">🏥 Healthcare consultations</div>
                            <div className="use-case">🎓 Educational settings</div>
                            <div className="use-case">🛒 Shopping & services</div>
                            <div className="use-case">👥 Social interactions</div>
                            <div className="use-case">📞 Customer support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section className="section tech-section">
                <div className="container">
                    <h2>Built by DevStack</h2>
                    <p className="tech-subtitle">Powered by Google's Production-Grade AI</p>
                    <div className="tech-stack">
                        <div className="tech-item">
                            <h4>MediaPipe Gesture Recognizer</h4>
                            <p>Google's pre-trained AI for gesture recognition</p>
                        </div>
                        <div className="tech-item">
                            <h4>MediaPipe Hands</h4>
                            <p>Real-time hand tracking with 21 landmarks</p>
                        </div>
                        <div className="tech-item">
                            <h4>Gemini 1.5 Flash</h4>
                            <p>Context-aware AI translation</p>
                        </div>
                        <div className="tech-item">
                            <h4>Firebase Platform</h4>
                            <p>Auth, Database, Hosting</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="container">
                    <h2>Ready to Break Down Communication Barriers?</h2>
                    <p>Start translating sign language in seconds</p>
                    <button className="cta-button-large" onClick={() => navigate('/translator')}>
                        Launch SignSpeak →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>Built with ❤️ for accessibility • Powered by DevStack</p>
                <p className="footer-sub">© 2025 SignSpeak</p>
            </footer>

            {/* Gesture Scroll Controls */}
            <div className="gesture-scroll-container">
                {error && (
                    <div className="gesture-error">
                        ⚠️ Camera Error: {error}
                    </div>
                )}

                {isActive && currentGesture && (
                    <div className="gesture-status active">
                        <span className="gesture-icon">{currentGesture}</span>
                    </div>
                )}

                <button
                    className={`gesture-toggle-btn ${isActive ? 'active' : ''}`}
                    onClick={toggleGestureScroll}
                >
                    <span>{isActive ? '🎥' : '✋'}</span>
                    <span>{isActive ? 'Disable Gesture Scroll' : 'Enable Gesture Scroll'}</span>
                </button>
            </div>

            {/* Instructions Modal */}
            {showInstructions && (
                <div className="gesture-instructions">
                    <h3>✋ Gesture Scroll Controls</h3>
                    <p>Use these hand gestures to scroll through the page:</p>
                    <ul>
                        <li>
                            <span className="gesture-emoji">🖐️</span>
                            <span><strong>Open Palm Up</strong> - Scroll up (fingers pointing up)</span>
                        </li>
                        <li>
                            <span className="gesture-emoji">🖐️</span>
                            <span><strong>Open Palm Down</strong> - Scroll down (fingers pointing down)</span>
                        </li>
                    </ul>
                    <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '20px' }}>
                        📷 Camera access required. Your video is processed locally and never stored.
                    </p>
                    <button onClick={startGestureScroll}>
                        Start Gesture Scrolling
                    </button>
                    <button onClick={() => setShowInstructions(false)}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
