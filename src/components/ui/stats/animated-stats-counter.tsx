"use client";

import React, { useState, useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

interface AnimatedStatsCounterProps {
  value: number;
  label: string;
  icon: LucideIcon;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  accentColor?: string;
}

export const AnimatedStatsCounter: React.FC<AnimatedStatsCounterProps> = ({
  value,
  label,
  icon: Icon,
  suffix = "",
  prefix = "",
  duration = 2000,
  delay = 0,
  accentColor = "oklch(0.628 0.198 19.33)"
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
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
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * value);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, value, duration]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div
      ref={ref}
      className={`
        relative group
        transform transition-all duration-1000 ease-out
        ${isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
        }
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Glow Background */}
      <div
        className={`
          absolute inset-0 rounded-2xl
          bg-gradient-to-br from-transparent via-transparent to-current
          opacity-0 group-hover:opacity-10 transition-opacity duration-700 ease-out
          blur-3xl
        `}
        style={{
          color: accentColor,
          transform: 'translateY(10px) scale(1.1)'
        }}
      />

      {/* Main Container */}
      <div
        className={`
          relative p-6 rounded-2xl
          border border-white/10
          bg-gradient-to-br from-white/[0.03] to-transparent
          backdrop-blur-sm
          group-hover:border-white/20
          transition-all duration-700 ease-out
          group-hover:scale-105
        `}
      >
        {/* Icon with animated background */}
        <div className="relative w-12 h-12 mx-auto mb-4">
          {/* Rotating ring background */}
          <div
            className={`
              absolute inset-0 rounded-full
              transition-all duration-1000 ease-out
              ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              background: `conic-gradient(from 0deg, ${accentColor}, transparent, ${accentColor})`,
              animation: isVisible ? 'rotate 3s linear infinite' : 'none'
            }}
          />

          {/* Inner circle */}
          <div
            className={`
              absolute inset-1 rounded-full
              bg-black/80 backdrop-blur-sm
              flex items-center justify-center
            `}
          >
            <Icon
              className="w-6 h-6 transition-all duration-700 ease-out group-hover:scale-110"
              style={{
                color: accentColor,
                filter: `drop-shadow(0 0 8px ${accentColor}40)`
              }}
            />
          </div>
        </div>

        {/* Animated Number */}
        <div className="text-center mb-2">
          <div
            className={`
              font-heading text-3xl font-bold tabular-nums
              transition-all duration-700 ease-out
              group-hover:scale-105
            `}
            style={{
              color: 'white',
              textShadow: isVisible ? `0 0 20px ${accentColor}40` : 'none'
            }}
          >
            {prefix}{formatNumber(count)}{suffix}
          </div>
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="font-body text-sm text-white/70 group-hover:text-white/90 transition-colors duration-700 ease-out">
            {label}
          </p>
        </div>

        {/* Floating particles when hovered */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: accentColor,
                left: `${15 + i * 20}%`,
                top: `${20 + i * 15}%`,
                animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                boxShadow: `0 0 4px ${accentColor}`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-8px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

interface StatsGridProps {
  stats: Array<{
    value: number;
    label: string;
    icon: LucideIcon;
    suffix?: string;
    prefix?: string;
  }>;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <AnimatedStatsCounter
          key={index}
          {...stat}
          delay={index * 200}
          accentColor={index % 2 === 0 ? "oklch(0.628 0.198 19.33)" : "oklch(0.546 0.222 264.38)"}
        />
      ))}
    </div>
  );
};

export default AnimatedStatsCounter;