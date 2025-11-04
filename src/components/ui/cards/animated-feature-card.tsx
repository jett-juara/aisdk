"use client";

import React, { useState } from "react";
import { LucideIcon } from "lucide-react";

interface AnimatedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  accentColor?: string;
}

export const AnimatedFeatureCard: React.FC<AnimatedFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay = 0,
  accentColor = "oklch(0.628 0.198 19.33)" // Default burgundy accent
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        relative group cursor-pointer
        transform transition-all duration-700 ease-out
        ${isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
        }
        ${isHovered ? 'scale-105 -translate-y-2' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {/* Glow Background Effect */}
      <div
        className={`
          absolute inset-0 rounded-2xl
          bg-gradient-to-br from-transparent via-transparent to-current
          opacity-0 transition-opacity duration-700 ease-out
          blur-3xl
          ${isHovered ? 'opacity-20' : ''}
        `}
        style={{
          color: accentColor,
          transform: 'translateY(20px) scale(1.1)',
          transformOrigin: 'center'
        }}
      />

      {/* Border Glow Effect */}
      <div
        className={`
          absolute inset-0 rounded-2xl
          transition-all duration-700 ease-out
          ${isHovered
            ? 'shadow-2xl'
            : 'shadow-lg'
          }
        `}
        style={{
          boxShadow: isHovered
            ? `0 0 40px ${accentColor}40, 0 0 80px ${accentColor}20`
            : '0 4px 20px oklch(0.145 0 0)80'
        }}
      />

      {/* Glass Morphism Border */}
      <div
        className={`
          absolute inset-0 rounded-2xl
          border border-white/10
          bg-gradient-to-br from-white/[0.05] to-transparent
          backdrop-blur-sm
          transition-all duration-700 ease-out
          ${isHovered ? 'border-white/20' : ''}
        `}
      />

      {/* Main Content */}
      <div className="relative p-8 text-center">
        {/* Icon Container */}
        <div
          className={`
            relative w-16 h-16 mx-auto mb-6
            flex items-center justify-center
            rounded-2xl
            transition-all duration-700 ease-out
            ${isHovered
              ? 'scale-110'
              : ''
            }
          `}
          style={{
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
            boxShadow: isHovered
              ? `0 8px 32px ${accentColor}40, inset 0 1px 0 oklch(1 0 0)20`
              : `0 4px 16px ${accentColor}20, inset 0 1px 0 oklch(1 0 0)10`
          }}
        >
          {/* Icon Glow */}
          <div
            className={`
              absolute inset-0 rounded-2xl
              transition-opacity duration-700 ease-out
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              background: `radial-gradient(circle at center, ${accentColor}40, transparent)`,
              filter: 'blur(8px)'
            }}
          />

          {/* Icon */}
          <Icon
            className="relative z-10 w-8 h-8 transition-all duration-700 ease-out"
            style={{
              color: accentColor,
              filter: isHovered ? `drop-shadow(0 0 8px ${accentColor})` : 'none'
            }}
          />
        </div>

        {/* Title */}
        <h3
          className={`
            font-heading text-2xl font-bold text-white mb-4
            transition-all duration-700 ease-out
            ${isHovered ? 'translate-y-1' : ''}
          `}
          style={{
            textShadow: isHovered ? `0 0 20px ${accentColor}60` : 'none'
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`
            font-body text-white/70 leading-relaxed
            transition-all duration-700 ease-out
            ${isHovered ? 'text-white/90 translate-y-1' : ''}
          `}
        >
          {description}
        </p>

        {/* Floating Particles Effect */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-pulse"
                style={{
                  backgroundColor: accentColor,
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 15}%`,
                  animation: `float ${3 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                  boxShadow: `0 0 6px ${accentColor}`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hover Shine Effect */}
      <div
        className={`
          absolute inset-0 rounded-2xl
          bg-gradient-to-tr from-transparent via-white/10 to-transparent
          opacity-0 transition-opacity duration-700 ease-out
          pointer-events-none
          ${isHovered ? 'opacity-100' : ''}
        `}
        style={{
          transform: isHovered ? 'translateX(-100%) translateY(-100%)' : 'translateX(-100%) translateY(-100%)',
          animation: isHovered ? 'shine 2s ease-in-out infinite' : 'none'
        }}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(180deg); }
          100% { transform: translateX(-100%) translateY(-100%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AnimatedFeatureCard;