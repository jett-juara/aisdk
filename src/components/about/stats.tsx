"use client"

import { useEffect, useState, useRef } from "react"

interface StatItem {
    value: number
    suffix: string
    label: string
}

const stats: StatItem[] = [
    { value: 275, suffix: "", label: "Events Organized" },
    { value: 12, suffix: "M+", label: "Audiences Engaged" },
    { value: 538, suffix: "", label: "Vendors & Talents" },
    { value: 134, suffix: "", label: "Cities Worldwide" },
]

function Counter({ end, suffix, duration = 2500 }: { end: number; suffix: string; duration?: number }) {
    const [count, setCount] = useState(0)
    const countRef = useRef(0)
    const startTimeRef = useRef<number | null>(null)

    useEffect(() => {
        startTimeRef.current = null
        setCount(0)
        countRef.current = 0

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp
            const progress = timestamp - startTimeRef.current
            const percentage = Math.min(progress / duration, 1)

            // Use linear easing for small numbers to prevent jumping, cubic for large numbers
            let ease
            if (end < 100) {
                ease = percentage
            } else {
                ease = 1 - Math.pow(1 - percentage, 3)
            }

            const currentCount = Math.floor(end * ease)

            if (countRef.current !== currentCount) {
                countRef.current = currentCount
                setCount(currentCount)
            }

            if (percentage < 1) {
                requestAnimationFrame(animate)
            } else {
                setCount(end)
            }
        }

        const frameId = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(frameId)
    }, [end, duration])

    return (
        <span>
            {count}
            {suffix}
        </span>
    )
}

export function AboutStats() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 transition-all duration-1000 ease-premium ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {stats.map((stat, index) => (
                <div key={index} className="flex flex-col gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-text-50 tracking-tight tabular-nums">
                        {isVisible ? (
                            <Counter end={stat.value} suffix={stat.suffix} />
                        ) : (
                            <span>0{stat.suffix}</span>
                        )}
                    </span>
                    <span className="text-sm md:text-base text-text-200 font-light tracking-wide">
                        {stat.label}
                    </span>
                </div>
            ))}
        </div>
    )
}
