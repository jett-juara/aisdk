"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface NavigationItem {
  id: number
  labelLine1: string
  labelLine2: string
  icon: React.ElementType
}

interface DetailSectionProps {
  stage: "idle" | "cards" | "content"
  onClose?: () => void
  title: string
  paragraphs: string[]
  imagePosition?: "left" | "right"
  navigationItems?: NavigationItem[]
  currentId?: number
  onNavigate?: (id: number) => void
}

export function DetailSection({
  stage,
  onClose,
  title,
  paragraphs,
  imagePosition,
  navigationItems,
  currentId,
  onNavigate,
}: DetailSectionProps) {
  const isContent = stage === "content"
  const isImageLeft = imagePosition === "left"

  return (
    <div className="flex flex-col gap-8">

      {/* Icon-Text Board Navigation */}
      {navigationItems && (
        <div className="w-full mb-6">
          <div className="flex flex-wrap gap-2 p-1.5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl w-full">
            {navigationItems.map((item) => {
              const isActive = currentId === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group min-w-[180px]
                    ${isActive
                      ? "bg-brand-500 text-text-50 shadow-lg"
                      : "text-text-200 hover:bg-glass-bg hover:text-text-50"
                    }
                  `}
                >
                  {/* Icon Container - Sized to match text height */}
                  <div className={`flex items-center justify-center w-8 h-8 ${isActive ? "text-text-50" : "text-brand-500 group-hover:text-text-50 transition-colors"}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>

                  {/* 2-Line Text */}
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">{item.labelLine1}</span>
                    <span className="text-xs font-bold uppercase tracking-widest">{item.labelLine2}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-12 lg:gap-20 ease-premium ${isContent ? "lg:translate-x-0 translate-y-0 opacity-100" : "lg:translate-x-0 translate-y-12 opacity-0"}`}
        style={{ transitionProperty: "transform, opacity", transitionDuration: "1000ms" }}>
        {/* Visual Area */}
        <div className={`order-1 ${isImageLeft ? "lg:order-1" : "lg:order-2"} lg:basis-[45%] flex flex-col w-full`}>
          <div
            className={`relative w-full h-[300px] lg:h-full min-h-[400px] rounded-3xl overflow-hidden border border-glass-border bg-glass-bg backdrop-blur-md transition-all duration-1000 cursor-pointer group focus:outline-none focus-visible:outline-none shadow-2xl ${isContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            onClick={() => onClose?.()}
            tabIndex={-1}
          >
            {/* Placeholder for future immersive content */}
            <div className="absolute inset-0 bg-gradient-to-br from-glass-bg to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center group-hover:scale-105 transition-transform duration-500 ease-premium">
                <div className="w-20 h-20 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center mx-auto mb-4 group-hover:bg-glass-bg-hover transition-colors">
                  <span className="text-3xl">✨</span>
                </div>
                <span className="text-text-200 font-mono text-sm uppercase tracking-widest group-hover:text-text-50 transition-colors">Visual Asset</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text Content Area */}
        <div className={`order-2 ${isImageLeft ? "lg:order-2" : "lg:order-1"} lg:basis-[55%] flex flex-col justify-center`}>
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl lg:text-7xl font-heading font-bold text-premium-gradient tracking-tight mb-4 leading-[1.1]">{title}</h2>
            </div>

            <div className="space-y-6">
              {paragraphs.map((paragraph, idx) => (
                <p key={idx}
                  className={`text-text-200 leading-relaxed text-lg transition-all duration-700 ${isContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${200 + idx * 100}ms` }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
