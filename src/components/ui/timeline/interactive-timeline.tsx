"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, MapPin, Award, Users } from "lucide-react";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon?: "calendar" | "map" | "award" | "users";
  accentColor?: string;
}

interface InteractiveTimelineProps {
  events: TimelineEvent[];
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ events }) => {
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set());
  const eventRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case "map": return MapPin;
      case "award": return Award;
      case "users": return Users;
      default: return Calendar;
    }
  };

  useEffect(() => {
    const observers = eventRefs.current.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleEvents(prev => new Set(prev).add(index));
          }
        },
        { threshold: 0.3 }
      );

      if (ref) observer.observe(ref);
      return observer;
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, []);

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 via-white/40 to-white/20 transform md:-translate-x-0.5" />

      {/* Timeline Events */}
      <div className="space-y-8 md:space-y-12">
        {events.map((event, index) => {
          const isVisible = visibleEvents.has(index);
          const isActive = activeEvent === index;
          const Icon = getIcon(event.icon);
          const accentColor = event.accentColor || (index % 2 === 0
            ? "oklch(0.628 0.198 19.33)"
            : "oklch(0.546 0.222 264.38)"
          );

          const isLeft = index % 2 === 0;

          return (
            <div
              key={index}
              ref={(el) => {
                if (el) eventRefs.current[index] = el;
              }}
              className={`
                relative flex items-center
                ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}
                flex-col md:flex-row
              `}
            >
              {/* Timeline Dot */}
              <div
                className={`
                  absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-2 border-black
                  transform -translate-x-1/2 md:-translate-x-1/2 translate-y-1/2 md:translate-y-1/2
                  transition-all duration-700 ease-out cursor-pointer
                  ${isActive ? 'scale-150' : 'hover:scale-125'}
                `}
                style={{
                  backgroundColor: accentColor,
                  boxShadow: isVisible
                    ? `0 0 20px ${accentColor}, 0 0 40px ${accentColor}40`
                    : `0 0 10px ${accentColor}`,
                  transform: `translate(-50%, -50%) ${isActive ? 'scale(1.5)' : isVisible ? 'scale(1)' : 'scale(0.8)'}`
                }}
                onMouseEnter={() => setActiveEvent(index)}
                onMouseLeave={() => setActiveEvent(null)}
              />

              {/* Pulsing ring effect */}
              {isVisible && (
                <div
                  className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 translate-y-1/2 md:translate-y-1/2"
                  style={{
                    backgroundColor: accentColor,
                    animation: 'pulse 2s ease-in-out infinite',
                    animationDelay: `${index * 0.5}s`
                  }}
                />
              )}

              {/* Content Card */}
              <div
                className={`
                  ml-12 md:ml-0 md:w-5/12
                  transform transition-all duration-1000 ease-out
                  ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                  }
                  ${isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}
                `}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div
                  className={`
                    relative p-6 rounded-2xl
                    border border-white/10
                    bg-gradient-to-br from-white/[0.05] to-transparent
                    backdrop-blur-sm
                    transition-all duration-700 ease-out cursor-pointer
                    ${isActive ? 'scale-105 border-white/30' : 'hover:border-white/20'}
                  `}
                  onMouseEnter={() => setActiveEvent(index)}
                  onMouseLeave={() => setActiveEvent(null)}
                >
                  {/* Glow Background */}
                  <div
                    className={`
                      absolute inset-0 rounded-2xl
                      opacity-0 transition-opacity duration-700 ease-out blur-3xl
                      ${isActive ? 'opacity-20' : ''}
                    `}
                    style={{
                      background: `radial-gradient(circle at center, ${accentColor}, transparent)`,
                      transform: 'translateY(10px) scale(1.2)'
                    }}
                  />

                  {/* Year Badge */}
                  <div
                    className={`
                      inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-3
                      transition-all duration-700 ease-out
                    `}
                    style={{
                      backgroundColor: `${accentColor}20`,
                      color: accentColor,
                      border: `1px solid ${accentColor}40`,
                      textShadow: isActive ? `0 0 10px ${accentColor}` : 'none'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {event.year}
                  </div>

                  {/* Title */}
                  <h3
                    className={`
                      font-heading text-xl font-bold text-white mb-2
                      transition-all duration-700 ease-out
                    `}
                    style={{
                      textShadow: isActive ? `0 0 15px ${accentColor}60` : 'none'
                    }}
                  >
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`
                      font-body text-white/70 leading-relaxed
                      transition-all duration-700 ease-out
                      ${isActive ? 'text-white/90' : ''}
                    `}
                  >
                    {event.description}
                  </p>

                  {/* Decorative Elements */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      {/* Floating particles */}
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full animate-pulse"
                          style={{
                            backgroundColor: accentColor,
                            left: `${10 + i * 30}%`,
                            top: `${20 + i * 20}%`,
                            animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                            boxShadow: `0 0 4px ${accentColor}`
                          }}
                        />
                      ))}

                      {/* Shine effect */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60"
                        style={{
                          animation: 'shine 3s ease-in-out infinite'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                <div
                  className={`
                    absolute top-1/2 w-8 h-0.5 transform -translate-y-1/2
                    transition-all duration-1000 ease-out
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                    ${isLeft
                      ? 'left-4 md:right-full md:mr-6'
                      : 'left-4 md:left-full md:ml-6'
                    }
                  `}
                  style={{
                    background: `linear-gradient(to ${isLeft ? 'left' : 'right'}, ${accentColor}, transparent)`,
                    transitionDelay: `${index * 200 + 500}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-6px) translateX(2px);
          }
          66% {
            transform: translateY(3px) translateX(-2px);
          }
        }

        @keyframes shine {
          0%, 100% {
            transform: translateX(-100%) translateY(-100%);
          }
          50% {
            transform: translateX(100%) translateY(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveTimeline;