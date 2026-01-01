import React, { useEffect, useState } from 'react';
import './RocketSplash.css';

const RocketSplash = ({ onFinish }) => {
    const [stars, setStars] = useState([]);
    const [isExiting, setIsExiting] = useState(false);
    const brandName = "Friendly Notebook";

    const handleEnter = () => {
        setIsExiting(true);
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 800); // Duration of the exit animation
    };

    useEffect(() => {
        const newStars = Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${Math.random() * 3 + 1}px`,
            duration: `${Math.random() * 2 + 1}s`,
            delay: `${Math.random() * 5}s`
        }));
        setStars(newStars);
    }, []);

    return (
        <div className={`rocket-splash-container ${isExiting ? 'exit-active' : ''}`} onClick={handleEnter}>
            <div className="space-overlay"></div>

            <div className="stars">
                {stars.map(star => (
                    <div
                        key={star.id}
                        className="star"
                        style={{
                            left: star.left,
                            top: star.top,
                            width: star.size,
                            height: star.size,
                            animationDuration: star.duration,
                            animationDelay: star.delay
                        }}
                    ></div>
                ))}
            </div>

            {/* Orbiting Graduation Cap */}
            <div className="flying-cap-container">
                <div className="flying-cap">
                    <div className="cap-top"></div>
                    <div className="cap-bottom"></div>
                    <div className="cap-tassel"></div>
                </div>
            </div>

            <div className="rocket-scene">
                <div className="rocket-wrapper">
                    <div className="rocket">
                        <div className="rocket-window"></div>
                        <div className="rocket-fins-left"></div>
                        <div className="rocket-fins-right"></div>
                        <div className="exhaust-flame"></div>
                        <div className="engine-glow"></div>
                    </div>
                </div>
            </div>

            <div className="brand-container">
                <div className="brand-arc">
                    {brandName.split("").map((char, index) => {
                        // Calculate rotation for arc effect
                        const totalChars = brandName.length;
                        const angle = (index - (totalChars - 1) / 2) * 12; // 12 degrees apart
                        return (
                            <span
                                key={index}
                                style={{
                                    animationDelay: `${0.8 + index * 0.1}s`,
                                    transform: `rotate(${angle}deg) translateY(-20px)`,
                                    transformOrigin: 'bottom center',
                                    display: 'inline-block'
                                }}
                                className="letter"
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className="loading-ui">
                <div className="loading-text">Igniting Friendly Workspace</div>
                <div className="loading-bar-wrapper">
                    <div className="loading-bar"></div>
                </div>
                <div className="launch-status">System Check: Optimal</div>
                <div className="touch-hint pulse">Tap anywhere to Enter 🚀</div>
            </div>

            <div className="vignan-tag">Vignan's Modern Academy</div>
        </div>
    );
};

export default RocketSplash;
