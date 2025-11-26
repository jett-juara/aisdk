import React from 'react';

/**
 * SettingGridBackground - Clean grid pattern background
 * Menggunakan pattern dari collaboration layout dengan fill disesuaikan
 * Warna disesuaikan dengan color system dari global.css untuk setting theme
 */
export function SettingGridBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Grid Pattern Overlay - Setting Theme (Brand & Background Tones) */}
            <svg
                className="absolute inset-0 z-0 w-full h-full opacity-[0.20] pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="setting-grid-pattern"
                        width="300"
                        height="300"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Row 1 - Brand Dominant */}
                        <rect x="0" y="0" width="100" height="100" fill="#87139b" opacity="0.4" /> {/* brand-500 */}
                        <rect x="100" y="0" width="100" height="100" fill="#ab1e7e" opacity="0.35" /> {/* brand-600 */}
                        <rect x="200" y="0" width="100" height="100" fill="#760f54" opacity="0.3" /> {/* brand-700 */}

                        {/* Row 2 - Deep Tones with Background Accent */}
                        <rect x="0" y="100" width="100" height="100" fill="#5a2a5a" opacity="0.35" /> {/* background-brand-800 */}
                        <rect x="100" y="100" width="100" height="100" fill="#1e3442" opacity="0.3" /> {/* background-600 */}
                        <rect x="200" y="100" width="100" height="100" fill="#87139b" opacity="0.3" /> {/* brand-500 */}

                        {/* Row 3 - Mixed Tones */}
                        <rect x="0" y="200" width="100" height="100" fill="#ab1e7e" opacity="0.3" /> {/* brand-600 */}
                        <rect x="100" y="200" width="100" height="100" fill="#182a35" opacity="0.35" /> {/* background-700 */}
                        <rect x="200" y="200" width="100" height="100" fill="#87139b" opacity="0.4" /> {/* brand-500 */}

                        {/* Grid lines */}
                        <path
                            d="M100,0 L100,300 M200,0 L200,300 M0,100 L300,100 M0,200 L300,200"
                            fill="none"
                            stroke="white"
                            strokeWidth="0.5"
                            opacity="0.6"
                        />
                    </pattern>

                    {/* Vertical Fade Mask */}
                    <mask id="setting-vertical-fade-mask">
                        <linearGradient
                            id="setting-vertical-fade-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="0%" stopColor="black" />
                            <stop offset="15%" stopColor="white" stopOpacity="0.3" />
                            <stop offset="35%" stopColor="white" />
                            <stop offset="65%" stopColor="white" />
                            <stop offset="85%" stopColor="white" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="black" />
                        </linearGradient>
                        <rect width="100%" height="100%" fill="url(#setting-vertical-fade-gradient)" />
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="url(#setting-grid-pattern)"
                    mask="url(#setting-vertical-fade-mask)"
                />
            </svg>
        </div>
    );
}

