"use client";

import React, { useState, useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

interface SkillProps {
  name: string;
  level: number; // 0-100
  icon: LucideIcon;
  color?: string;
  delay?: number;
}

interface AnimatedProgressRingProps extends SkillProps {
  size?: number;
  strokeWidth?: number;
}

const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  name,
  level,
  icon: Icon,
  color = "oklch(0.628 0.198 19.33)",
  delay = 0,
  size = 120,
  strokeWidth = 8
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const duration = 2000; // 2 seconds
      const progressRatio = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
      setProgress(easeOutQuart * level);

      if (progressRatio < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, level]);

  // SVG calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      ref={ref}
      className={`
        relative group cursor-pointer
        transform transition-all duration-1000 ease-out
        ${isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
        }
        ${isHovered ? 'scale-110' : ''}
      `}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Background */}
      <div
        className={`
          absolute inset-0 rounded-full
          opacity-0 transition-opacity duration-700 ease-out blur-2xl
          ${isHovered ? 'opacity-30' : 'opacity-0'}
        `}
        style={{
          background: `radial-gradient(circle at center, ${color}, transparent)`,
          transform: 'scale(1.3)'
        }}
      />

      {/* Outer rotating ring */}
      <div
        className={`
          absolute inset-0 rounded-full
          opacity-0 transition-opacity duration-1000 ease-out
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: `conic-gradient(from 0deg, ${color}, transparent, ${color})`,
          animation: isVisible ? 'rotate 4s linear infinite' : 'none',
          animationDelay: `${delay + 500}ms`
        }}
      />

      {/* SVG Progress Ring */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="oklch(0.145 0 0)"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />

        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
          style={{
            filter: isHovered ? `drop-shadow(0 0 12px ${color})` : 'none'
          }}
        />

        {/* Inner decorative dots */}
        {isVisible && [...Array(8)].map((_, i) => (
          <circle
            key={i}
            cx={size / 2 + (radius - 4) * Math.cos((i * Math.PI * 2) / 8)}
            cy={size / 2 + (radius - 4) * Math.sin((i * Math.PI * 2) / 8)}
            r="2"
            fill={color}
            opacity={0.6}
            style={{
              animation: `pulse ${2 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${delay + i * 100}ms`
            }}
          />
        ))}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Icon */}
        <div
          className={`
            relative w-8 h-8 mb-1
            transition-all duration-700 ease-out
            ${isHovered ? 'scale-125' : ''}
          `}
        >
          <Icon
            className="w-8 h-8 transition-all duration-700 ease-out"
            style={{
              color: color,
              filter: isHovered ? `drop-shadow(0 0 8px ${color})` : 'none'
            }}
          />

          {/* Icon glow */}
          {isHovered && (
            <div
              className="absolute inset-0 blur-md"
              style={{
                backgroundColor: color,
                opacity: 0.4,
                transform: 'scale(1.5)'
              }}
            />
          )}
        </div>

        {/* Percentage */}
        <div
          className={`
            font-heading text-lg font-bold tabular-nums
            transition-all duration-700 ease-out
          `}
          style={{
            color: 'white',
            textShadow: isHovered ? `0 0 10px ${color}` : 'none'
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      {/* Skill name below */}
      <div className="mt-4 text-center">
        <p
          className={`
            font-body text-sm font-medium
            transition-all duration-700 ease-out
            ${isHovered ? 'text-white' : 'text-white/80'}
          `}
          style={{
            textShadow: isHovered ? `0 0 8px ${color}60` : 'none'
          }}
        >
          {name}
        </p>
      </div>

      {/* Floating particles when hovered */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                backgroundColor: color,
                left: `${20 + i * 15}%`,
                top: `${20 + i * 15}%`,
                animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                boxShadow: `0 0 6px ${color}`,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

interface SkillsGridProps {
  skills: SkillProps[];
}

export const SkillsGrid: React.FC<SkillsGridProps> = ({ skills }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
      {skills.map((skill, index) => (
        <div key={index} className="flex justify-center">
          <AnimatedProgressRing
            {...skill}
            delay={index * 200}
            color={
              index % 3 === 0
                ? "oklch(0.628 0.198 19.33)" // Burgundy
                : index % 3 === 1
                ? "oklch(0.546 0.222 264.38)" // Purple
                : "oklch(0.627 0.265 281.97)" // Blue
            }
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedProgressRing;