import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = ({ message = "Loading AI Model..." }) => {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="google-logo">
                    <span className="logo-text">
                        <span className="logo-s">Sign</span>
                        <span className="logo-speak">Speak</span>
                    </span>
                </div>

                <div className="loading-spinner">
                    <div className="spinner-circle"></div>
                </div>

                <p className="loading-message">{message}</p>
                <p className="loading-submessage">Powered by Google MediaPipe AI</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
