import React, { useEffect, useState } from 'react';
import { FaCrown, FaBook, FaRegFileAlt, FaSpaceShuttle, FaRocket } from 'react-icons/fa';
import './RocketSplash.css';

const RocketSplash = ({ onFinish }) => {
    const [stars, setStars] = useState([]);
    const [isExiting, setIsExiting] = useState(false);
    const brandName = "Friendly Notebook";

    const handleEnter = () => {
        setIsExiting(true);
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 800);
    };

    useEffect(() => {
        const newStars = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${Math.random() * 2 + 1}px`,
            duration: `${Math.random() * 3 + 1}s`,
            delay: `${Math.random() * 5}s`
        }));
        setStars(newStars);
    }, []);

    return (
        <div className={`rocket-splash-container ${isExiting ? 'exit-active' : ''}`} onClick={handleEnter}>
            {/* Solar System Background */}
            <div className="solar-system">
                <div className="planet p-1"></div>
                <div className="planet p-2"></div>
                <div className="planet p-3"></div>
                <div className="planet p-4"></div>
            </div>

            <div className="speed-lines">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="line" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>
                ))}
            </div>

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

            {/* Floating Educational Assets */}
            <div className="floating-assets">
                <div className="asset-item book-1"><FaBook /></div>
                <div className="asset-item paper-1"><FaRegFileAlt /></div>
                <div className="asset-item paper-2"><FaRegFileAlt /></div>
                <div className="asset-item cap-1">🎓</div>
            </div>

            <div className="rocket-scene">
                <div className="rocket-path-zig-zag">
                    <div className="rocket-wrapper">
                        <div className="shuttle-3d">
                            <FaSpaceShuttle className="shuttle-icon" />
                            <div className="shuttle-exhaust">
                                <div className="flame-core"></div>
                                <div className="flame-glow"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="brand-gate">
                <div className="brand-main">
                    {brandName.split("").map((char, index) => {
                        const delay = 0.5 + index * 0.08;
                        return (
                            <span
                                key={index}
                                style={{ animationDelay: `${delay}s` }}
                                className="letter-3d"
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        );
                    })}
                </div>
                <div className="creator-tag">
                    Created by <span className="creator-name">Bobby Martin <FaCrown className="crown-icon" /></span>
                </div>
            </div>

            <div className="interface-hud">
                <div className="hud-line">SYSTEM INITIATING...</div>
                <div className="loading-meter">
                    <div className="meter-fill"></div>
                </div>
                <div className="hud-metrics">
                    <span>STABILITY: 100%</span>
                    <span>GRAVITY: 0.0g</span>
                </div>
                <div className="enter-action">
                    <div className="action-circle">
                        <FaRocket />
                    </div>
                    <span className="action-text">FORCE START MISSION</span>
                </div>
            </div>

            <div className="vignan-identity">Vignan's University • Next-Gen Portal</div>
        </div>
    );
};

export default RocketSplash;
