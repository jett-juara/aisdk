"use client"

import React from "react"
import Image from "next/image"
import { Undo2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavigationItem {
  id: string | number
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
  currentId?: string | number
  onNavigate?: (id: string | number) => void
  imageUrl?: string
  imageAlt?: string
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
  imageUrl,
  imageAlt,
}: DetailSectionProps) {
  const isContent = stage === "content"
  const isImageLeft = imagePosition === "left"
  const activeItem = navigationItems?.find(item => item.id === currentId) || navigationItems?.[0]
  const ActiveIcon = activeItem?.icon

  return (
    <div className="flex flex-col gap-4 lg:gap-8">

      {/* Icon-Text Board Navigation */}
      {navigationItems && (
        <div className="w-full mb-2 lg:mb-4">
          {/* Mobile Dropdown Navigation */}
          <div className="flex md:hidden gap-2 w-full">
            {/* Back Button */}
            <button
              onClick={() => onClose?.()}
              className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border text-text-200 hover:text-text-50 transition-colors"
            >
              <Undo2 className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {/* Dropdown Trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 flex items-center justify-between px-4 h-12 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border text-left">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const activeItem = navigationItems.find(item => item.id === currentId) || navigationItems[0]
                      const Icon = activeItem.icon
                      return (
                        <>
                          <Icon className="w-5 h-5 text-text-50" />
                          <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{activeItem.labelLine1}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-text-50">{activeItem.labelLine2}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <ChevronDown className="w-5 h-5 text-text-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-background-900/95 backdrop-blur-xl border-glass-border p-2 rounded-xl">
                {navigationItems.map((item) => {
                  const isActive = currentId === item.id
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => onNavigate?.(item.id)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer mb-1 last:mb-0 focus:bg-glass-bg focus:text-text-50
                        ${isActive ? "bg-brand-800 text-text-50" : "text-text-200 hover:text-text-50 hover:bg-glass-bg"}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{item.labelLine1}</span>
                        <span className="text-xs font-bold uppercase tracking-widest">{item.labelLine2}</span>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tablet Dropdown Navigation (MD only) */}
          <div className="hidden md:flex lg:hidden gap-2 w-full">
            {/* Back Button */}
            <button
              onClick={() => onClose?.()}
              className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border text-text-200 hover:text-text-50 transition-colors"
            >
              <Undo2 className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {/* Dropdown Trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 flex items-center justify-between px-4 h-12 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border text-left">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const activeItem = navigationItems.find(item => item.id === currentId) || navigationItems[0]
                      const Icon = activeItem.icon
                      return (
                        <>
                          <Icon className="w-5 h-5 text-text-50" />
                          <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{activeItem.labelLine1}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-text-50">{activeItem.labelLine2}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <ChevronDown className="w-5 h-5 text-text-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-background-900/95 backdrop-blur-xl border-glass-border p-2 rounded-xl">
                {navigationItems.map((item) => {
                  const isActive = currentId === item.id
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => onNavigate?.(item.id)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer mb-1 last:mb-0 focus:bg-glass-bg focus:text-text-50
                        ${isActive ? "bg-brand-800 text-text-50" : "text-text-200 hover:text-text-50 hover:bg-glass-bg"}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{item.labelLine1}</span>
                        <span className="text-xs font-bold uppercase tracking-widest">{item.labelLine2}</span>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Board Navigation */}
          <div className="hidden lg:flex flex-nowrap justify-center gap-2 p-1.5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl w-full overflow-x-auto no-scrollbar">
            {/* Back Button */}
            <button
              onClick={() => onClose?.()}
              className={`
                flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 group aspect-square
                text-text-200 hover:bg-glass-bg hover:text-text-50
              `}
            >
              <div className="flex items-center justify-center w-8 h-8 text-text-200 group-hover:text-text-50 transition-colors">
                <Undo2 className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </button>

            {navigationItems.map((item) => {
              const isActive = currentId === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={`
                    flex-1 min-w-[140px] flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group
                    ${isActive
                      ? "bg-brand-800 text-text-50 shadow-lg"
                      : "text-text-200 hover:bg-glass-bg hover:text-text-50"
                    }
                  `}
                >
                  {/* Icon Container - Sized to match text height */}
                  <div className={`flex items-center justify-center w-8 h-8 ${isActive ? "text-text-50" : "text-text-200 group-hover:text-text-50 transition-colors"}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>

                  {/* 2-Line Text */}
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5 whitespace-nowrap">{item.labelLine1}</span>
                    <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">{item.labelLine2}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-8 lg:gap-20 ease-premium ${isContent ? "lg:translate-x-0 translate-y-0 opacity-100" : "lg:translate-x-0 translate-y-12 opacity-0"}`}
        style={{ transitionProperty: "transform, opacity", transitionDuration: "1000ms" }}>
        {/* Visual Area */}
        <div className={`order-1 ${isImageLeft ? "lg:order-1" : "lg:order-2"} lg:basis-[45%] flex flex-col w-full`}>
          <div
            className={`relative w-full h-[300px] lg:h-full min-h-[400px] rounded-3xl overflow-hidden border border-glass-border bg-glass-bg backdrop-blur-md transition-all duration-1000 shadow-2xl ${isContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={imageAlt || title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-glass-bg to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center transition-transform duration-500 ease-premium">
                    <div className="w-20 h-20 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center mx-auto mb-4 transition-colors">
                      {ActiveIcon ? <ActiveIcon className="h-8 w-8 text-text-100" /> : <span className="text-3xl">✨</span>}
                    </div>
                    <span className="text-text-200 font-mono text-sm uppercase tracking-widest transition-colors">Visual Asset</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Text Content Area */}
        <div className={`order-2 ${isImageLeft ? "lg:order-2" : "lg:order-1"} lg:basis-[55%] flex flex-col justify-center`}>
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-7xl font-heading font-bold text-text-100 tracking-tight mb-4 leading-[1.1]">{title}</h2>
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
