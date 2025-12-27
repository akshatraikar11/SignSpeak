import React, { useState } from 'react';
import { SIGN_LIBRARY, CATEGORIES } from '../config/signs';
import '../styles/SignGuide.css';

const SignGuide = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const getFilteredSigns = () => {
        const allSigns = Object.values(SIGN_LIBRARY);
        if (selectedCategory === 'all') {
            return allSigns;
        }
        return allSigns.filter(sign => sign.category === selectedCategory);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                className="sign-guide-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title="View Sign Guide"
            >
                📚 Sign Guide ({Object.keys(SIGN_LIBRARY).length} signs)
            </button>

            {/* Modal/Panel */}
            {isOpen && (
                <div className="sign-guide-overlay" onClick={() => setIsOpen(false)}>
                    <div className="sign-guide-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="sign-guide-header">
                            <h2>🤟 ASL Sign Reference</h2>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                        </div>

                        {/* Category Filter */}
                        <div className="category-filter">
                            <button
                                className={selectedCategory === 'all' ? 'active' : ''}
                                onClick={() => setSelectedCategory('all')}
                            >
                                All ({Object.keys(SIGN_LIBRARY).length})
                            </button>
                            {Object.entries(CATEGORIES).map(([key, label]) => {
                                const count = Object.values(SIGN_LIBRARY).filter(s => s.category === key).length;
                                return (
                                    <button
                                        key={key}
                                        className={selectedCategory === key ? 'active' : ''}
                                        onClick={() => setSelectedCategory(key)}
                                    >
                                        {label} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* Signs Grid */}
                        <div className="signs-grid">
                            {getFilteredSigns().map((sign, index) => (
                                <div key={index} className="sign-card">
                                    <div className="sign-name">{sign.name}</div>
                                    <div className="sign-description">{sign.description}</div>
                                    <div className="sign-category">{CATEGORIES[sign.category]}</div>
                                </div>
                            ))}
                        </div>

                        {getFilteredSigns().length === 0 && (
                            <div className="no-signs">No signs in this category</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SignGuide;
