import React from 'react';

export function AuthGridBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">


            {/* Ambient Glows - Slate/Teal/Gold Theme */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-amber-700/10 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Spotlight Stage Overlay */}
            {/* Main spotlight from top center - Slate/Blue-gray */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_-20%,rgba(51,65,85,0.25)_0%,rgba(51,65,85,0.12)_30%,transparent_60%)]" />

            {/* Secondary spotlight from top-right - Teal */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_0%,rgba(20,184,166,0.15)_0%,rgba(20,184,166,0.08)_35%,transparent_55%)]" />

            {/* Stage glow from bottom - Gold/Amber */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_100%,rgba(217,119,6,0.1)_0%,transparent_40%)]" />

            {/* Subtle particles overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Grid Pattern Overlay */}
            <svg className="absolute inset-0 z-0 w-full h-full opacity-[0.15] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="auth-grid-pattern" width="300" height="300" patternUnits="userSpaceOnUse">
                        {/* Row 1 - Slate/Teal dominant */}
                        <rect x="0" y="0" width="100" height="100" fill="#0f172a" opacity="0.4" /> {/* Slate 900 */}
                        <rect x="100" y="0" width="100" height="100" fill="#115e59" opacity="0.35" /> {/* Teal 800 */}
                        <rect x="200" y="0" width="100" height="100" fill="#334155" opacity="0.3" /> {/* Slate 700 */}

                        {/* Row 2 - Darker tones with Gold accent */}
                        <rect x="0" y="100" width="100" height="100" fill="#1e293b" opacity="0.35" /> {/* Slate 800 */}
                        <rect x="100" y="100" width="100" height="100" fill="#0f172a" opacity="0.3" /> {/* Slate 900 */}
                        <rect x="200" y="100" width="100" height="100" fill="#b45309" opacity="0.25" /> {/* Amber 700 */}

                        {/* Row 3 - Teal/Slate mix */}
                        <rect x="0" y="200" width="100" height="100" fill="#134e4a" opacity="0.3" /> {/* Teal 900 */}
                        <rect x="100" y="200" width="100" height="100" fill="#334155" opacity="0.35" /> {/* Slate 700 */}
                        <rect x="200" y="200" width="100" height="100" fill="#0f172a" opacity="0.4" /> {/* Slate 900 */}

                        {/* Grid lines - vertical and horizontal */}
                        <path d="M100,0 L100,300 M200,0 L200,300 M0,100 L300,100 M0,200 L300,200"
                            fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                    </pattern>

                    {/* Vertical Fade Mask - Fades out top and bottom */}
                    <mask id="auth-vertical-fade-mask">
                        <linearGradient id="auth-vertical-fade-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="black" />
                            <stop offset="15%" stopColor="white" stopOpacity="0.3" />
                            <stop offset="35%" stopColor="white" />
                            <stop offset="65%" stopColor="white" />
                            <stop offset="85%" stopColor="white" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="black" />
                        </linearGradient>
                        <rect width="100%" height="100%" fill="url(#auth-vertical-fade-gradient)" />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="url(#auth-grid-pattern)" mask="url(#auth-vertical-fade-mask)" />
            </svg>
        </div>
    );
}
