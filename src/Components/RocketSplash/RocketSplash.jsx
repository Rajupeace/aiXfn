import React, { useEffect, useState } from 'react';
import { FaRocket, FaCrown, FaAtom, FaBook, FaLaptop, FaGraduationCap, FaFlask, FaMicroscope } from 'react-icons/fa';
import { GiUfo, GiGalaxy, GiPaper, GiPencilRuler, GiDna1 } from 'react-icons/gi';
import './RocketSplash.css';

const RocketSplash = ({ onFinish }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [textRevealed, setTextRevealed] = useState(false);

    useEffect(() => {
        // Trigger text reveal after initial mount
        setTimeout(() => setTextRevealed(true), 500);
    }, []);

    const handleEnter = () => {
        setIsExiting(true);
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 2000); // 2s exit animation (Slowed down)
    };

    return (
        <div className={`rocket-splash-container ${isExiting ? 'exit-active' : ''}`} onClick={handleEnter}>
            {/* Background Layers */}
            <div className="rs-stars-bg"></div>
            <div className="rs-nebula"></div>

            {/* Floating 3D Educational Debris */}
            <div className="rs-floating-debris">
                <FaBook className="debris-item d-book" />
                <FaLaptop className="debris-item d-laptop" />
                <FaGraduationCap className="debris-item d-cap" />
                <FaFlask className="debris-item d-flask" />
                <FaMicroscope className="debris-item d-scope" />
                <GiPaper className="debris-item d-paper" />
                <GiPencilRuler className="debris-item d-ruler" />
                <GiDna1 className="debris-item d-dna" />
            </div>

            {/* Main Content */}
            <div className="rs-center-stage">

                {/* 3D Floating Icon wrapper */}
                <div className="rs-icon-wrapper">
                    <div className="rs-orbit-ring ring-1"></div>
                    <div className="rs-orbit-ring ring-2"></div>
                    <div className="rs-orbit-ring ring-3"></div>
                    <div className="rs-main-icon">
                        <FaRocket className="rocket-3d" />
                    </div>
                    <div className="rs-thrust-glow"></div>
                </div>

                {/* Animated Typography */}
                <div className={`rs-brand-container ${textRevealed ? 'reveal' : ''}`}>
                    {/* Main Title Replaces AIXFN LABS */}
                    <div className="rs-product-identity main-identity">
                        <div className="rs-product-name-3d large-title">FRIENDLY NOTEBOOK</div>
                        <div className="rs-product-glow"></div>
                    </div>

                    <div className="rs-tagline">
                        <span className="rs-tag-part">NEXT-GEN STUDENT PORTAL</span>
                    </div>
                </div>

                {/* Interactive Trigger */}
                <div className="rs-action-area">
                    <div className="rs-click-hint">
                        <span className="rs-click-text">TAP TO LAUNCH</span>
                        <div className="rs-progress-bar">
                            <div className="rs-progress-fill"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Signature */}
            <div className="rs-footer">
                <span>Vignan's University</span>
                <span className="rs-separator">|</span>
                <span>Designed by <span className="rs-author">Bobby Martin <FaCrown size={10} color="#fbbf24" /></span></span>
            </div>

            {/* White Flash Layer (Moved to end for Z-Index safety) */}
            <div className="rs-white-flash"></div>
        </div>
    );
};

export default RocketSplash;
