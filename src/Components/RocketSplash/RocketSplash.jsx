import React, { useEffect, useState } from 'react';
import { FaCrown, FaBook, FaRegFileAlt, FaFlask, FaMicroscope, FaGraduationCap, FaRocket, FaAtom, FaDna, FaBrain } from 'react-icons/fa';
import { GiUfo, GiPencilRuler, GiScales, GiProcessor, GiMaterialsScience, GiOpenBook, GiPaper, GiScrollUnfurled } from 'react-icons/gi';
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

            {/* Floating Educational & Lab Assets - Expanded Grid */}
            <div className="floating-assets">
                {/* Layer 1: Books & Papers */}
                <div className="asset-item book-1"><FaBook /></div>
                <div className="asset-item paper-1"><FaRegFileAlt /></div>
                <div className="asset-item paper-2"><GiPaper /></div>
                <div className="asset-item scroll-1"><GiScrollUnfurled /></div>

                {/* Layer 2: Lab & Science */}
                <div className="asset-item flask-1"><FaFlask /></div>
                <div className="asset-item microscope-1"><FaMicroscope /></div>
                <div className="asset-item atom-1"><FaAtom /></div>
                <div className="asset-item dna-1"><FaDna /></div>

                {/* Layer 3: Tools & Metrics */}
                <div className="asset-item ruler-1"><GiPencilRuler /></div>
                <div className="asset-item scale-1"><GiScales /></div>
                <div className="asset-item processor-1"><GiProcessor /></div>
                <div className="asset-item science-1"><GiMaterialsScience /></div>

                {/* Layer 4: Intelligence */}
                <div className="asset-item cap-1"><FaGraduationCap /></div>
                <div className="asset-item brain-1"><FaBrain /></div>
                <div className="asset-item open-book-1"><GiOpenBook /></div>
            </div>

            <div className="rocket-scene">
                <div className="rocket-path-zig-zag">
                    <div className="rocket-wrapper">
                        <div className="ufo-3d">
                            <GiUfo className="ufo-icon alien-ship" />
                            <div className="ufo-beam"></div>
                            <div className="ufo-energy-ring"></div>
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
                                className="letter-3d highlight-font"
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
                <div className="loading-meter">
                    <div className="meter-fill"></div>
                </div>
                <div className="enter-action">
                    <div className="action-circle">
                        <GiUfo className="mini-ufo" />
                    </div>
                    <span className="action-text">ENGAGE SYSTEM</span>
                </div>
            </div>

            <div className="vignan-identity">Vignan's University • Cybernetic Core 2026</div>
        </div>
    );
};

export default RocketSplash;
