import React from 'react';

export function TestimonialGridBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-r-2xl">
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 bg-noise-overlay z-0" />

            {/* Ambient Glows - Indigo/Rose/Cyan Theme */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Spotlight Stage Overlay */}
            {/* Main spotlight from top center - Indigo */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_-20%,rgba(67,56,202,0.25)_0%,rgba(67,56,202,0.12)_30%,transparent_60%)]" />

            {/* Secondary spotlight from top-left - Cyan */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_0%,rgba(6,182,212,0.15)_0%,rgba(6,182,212,0.08)_35%,transparent_55%)]" />

            {/* Stage glow from bottom - Rose */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_100%,rgba(225,29,72,0.1)_0%,transparent_40%)]" />

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
                    <pattern id="testimonial-grid-pattern" width="300" height="300" patternUnits="userSpaceOnUse">
                        {/* Row 1 - Indigo/Cyan dominant */}
                        <rect x="0" y="0" width="100" height="100" fill="#312e81" opacity="0.4" /> {/* Indigo 900 */}
                        <rect x="100" y="0" width="100" height="100" fill="#0e7490" opacity="0.35" /> {/* Cyan 700 */}
                        <rect x="200" y="0" width="100" height="100" fill="#4338ca" opacity="0.3" /> {/* Indigo 700 */}

                        {/* Row 2 - Darker tones with Rose accent */}
                        <rect x="0" y="100" width="100" height="100" fill="#1e1b4b" opacity="0.35" /> {/* Indigo 950 */}
                        <rect x="100" y="100" width="100" height="100" fill="#be123c" opacity="0.3" /> {/* Rose 700 */}
                        <rect x="200" y="100" width="100" height="100" fill="#312e81" opacity="0.25" /> {/* Indigo 900 */}

                        {/* Row 3 - Cyan/Indigo mix */}
                        <rect x="0" y="200" width="100" height="100" fill="#0891b2" opacity="0.3" /> {/* Cyan 600 */}
                        <rect x="100" y="200" width="100" height="100" fill="#4338ca" opacity="0.35" /> {/* Indigo 700 */}
                        <rect x="200" y="200" width="100" height="100" fill="#1e1b4b" opacity="0.4" /> {/* Indigo 950 */}

                        {/* Grid lines - vertical and horizontal */}
                        <path d="M100,0 L100,300 M200,0 L200,300 M0,100 L300,100 M0,200 L300,200"
                            fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                    </pattern>

                    {/* Vertical Fade Mask - Fades out top and bottom */}
                    <mask id="testimonial-vertical-fade-mask">
                        <linearGradient id="testimonial-vertical-fade-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="black" />
                            <stop offset="15%" stopColor="white" stopOpacity="0.3" />
                            <stop offset="35%" stopColor="white" />
                            <stop offset="65%" stopColor="white" />
                            <stop offset="85%" stopColor="white" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="black" />
                        </linearGradient>
                        <rect width="100%" height="100%" fill="url(#testimonial-vertical-fade-gradient)" />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="url(#testimonial-grid-pattern)" mask="url(#testimonial-vertical-fade-mask)" />
            </svg>
        </div>
    );
}
