"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { BookOpen, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import type { ImageGridItem } from "@/lib/cms/marketing"

interface CollaborationHeroProps {
    heading?: string
    subheading?: string
    description?: string
    imageGridItems?: ImageGridItem[]
    detailBlocks?: Record<string, { title?: string; paragraphs?: string[]; imageUrl?: string; altText?: string }>
}

export function CollaborationHero({
    heading = "Partner with Juara",
    subheading = "Join Indonesia's premier event ecosystem.",
    description = "We are looking for passionate vendors, suppliers, and talents to create unforgettable experiences together. Access a wide network of high-profile clients and premium events.",
    imageGridItems = [],
    detailBlocks = {},
}: CollaborationHeroProps) {
    const router = useRouter()
    const [introStep, setIntroStep] = useState(0)
    const [hoveredId, setHoveredId] = useState<number | null>(null)
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")
    const [introReady, setIntroReady] = useState(false)

    const desiredCount = 2

    const fallbackItems: { id: number; slug: string; label: string; icon: LucideIcon; description: string; imageUrl?: string; altText?: string }[] = [
        { id: 1, slug: "partnership-guide", label: "Partnership Guide", icon: BookOpen, description: "Everything you need to know about becoming a Juara partner. Guidelines, requirements, and benefits." },
        { id: 2, slug: "chat-jett", label: "Chat JETT", icon: MessageSquare, description: "Meet JETT, Juara's AI assistant. Get instant answers about partnership, requirements, and more." },
    ]

    const getIconBySlug = (slug: string): LucideIcon => {
        const map: Record<string, LucideIcon> = {
            "partnership-guide": BookOpen,
            "chat-jett": MessageSquare,
        }
        return map[slug] || BookOpen
    }

    const useCMSImages = imageGridItems && imageGridItems.length > 0
    let items = useCMSImages
        ? imageGridItems.map((item: ImageGridItem, idx) => ({
            id: Number(item.id) || item.position || idx + 1,
            slug: item.slug,
            label: item.label,
            icon: getIconBySlug(item.slug),
            description: item.labelLine1 || item.labelLine2 || "Click to learn more",
            imageUrl: item.imageUrl ?? undefined,
            altText: item.altText ?? undefined,
        }))
        : fallbackItems

    if (useCMSImages && items.length < desiredCount) {
        const existingSlugs = new Set(items.map((i) => i.slug))
        const padded = [...items]
        for (const fb of fallbackItems) {
            if (padded.length >= desiredCount) break
            if (existingSlugs.has(fb.slug)) continue
            padded.push({ ...fb, id: fb.id + 1000 })
        }
        items = padded
    }

    const totalIntroSteps = items.length + 1
    const introDone = introStep >= totalIntroSteps
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])
    const frameRef = useRef<number | null>(null)
    const detailTimerRef = useRef<NodeJS.Timeout | null>(null)
    const introStartTimerRef = useRef<NodeJS.Timeout | null>(null)

    const resetIntroTimers = useCallback(() => {
        if (frameRef.current !== null) { cancelAnimationFrame(frameRef.current); frameRef.current = null }
        if (timeoutsRef.current.length) { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = [] }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => { setIntroReady(true) }, 100)
        return () => { clearTimeout(timer); if (introStartTimerRef.current) { clearTimeout(introStartTimerRef.current) } }
    }, [])

    useEffect(() => { return () => resetIntroTimers() }, [resetIntroTimers])

    useEffect(() => {
        if (selectedId !== null) { return }
        if (!introReady) { return }
        resetIntroTimers()
        const timer = setTimeout(() => { setIntroStep(0) }, 0)
        const run = (index: number) => {
            const timeoutId = setTimeout(() => {
                setIntroStep(index + 1)
                if (index < totalIntroSteps - 1) { frameRef.current = requestAnimationFrame(() => run(index + 1)) }
            }, index === 0 ? 160 : 240)
            timeoutsRef.current.push(timeoutId)
        }
        frameRef.current = requestAnimationFrame(() => run(0))
        return () => { clearTimeout(timer); resetIntroTimers() }
    }, [resetIntroTimers, selectedId, totalIntroSteps, introReady])

    useEffect(() => { if (selectedId !== null) { const t = setTimeout(() => setHoveredId(null), 0); return () => clearTimeout(t) } }, [selectedId])

    useEffect(() => {
        if (detailTimerRef.current) { clearTimeout(detailTimerRef.current); detailTimerRef.current = null }
        if (selectedId === null) { const t = setTimeout(() => setDetailStage("idle"), 0); return () => clearTimeout(t) }
        const t = setTimeout(() => {
            setDetailStage("cards")
            detailTimerRef.current = setTimeout(() => { setDetailStage("content"); detailTimerRef.current = null }, 400)
        }, 0)
        return () => { clearTimeout(t); if (detailTimerRef.current) { clearTimeout(detailTimerRef.current); detailTimerRef.current = null } }
    }, [selectedId])

    const handleCardClick = (id: number) => {
        if (selectedId === id) {
            setSelectedId(null); setHoveredId(null); setIntroStep(0); setDetailStage("idle"); resetIntroTimers(); setIntroReady(false)
            if (introStartTimerRef.current) { clearTimeout(introStartTimerRef.current) }
            introStartTimerRef.current = setTimeout(() => { setIntroReady(true) }, 600)
        } else { setSelectedId(id) }
    }

    const handleCloseDetail = () => {
        if (!selectedId) return
        handleCardClick(selectedId)
    }

    const selectedItem = items.find((item) => item.id === selectedId)
    const detailMap = detailBlocks || {}

    return (
        <section className={`relative flex-1 min-h-0 w-full flex items-start -mt-8 lg:mt-0 ${selectedId ? "pt-0 lg:pt-8" : "pt-0 lg:pt-8"} overflow-visible transition-all duration-500`}>
            <div className={`relative z-10 flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto lg:px-8`}>
                {!selectedId && (
                    <div className="flex flex-col lg:flex-row lg:items-start w-full gap-12 lg:gap-20">
                        {/* Hero Text Section */}
                        <div className="lg:flex-1 flex flex-col justify-start">
                            <div className={`w-full transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"}`}>
                                {introStep > 0 && (
                                    <div className="flex flex-col gap-8">
                                        {/* Desktop View */}
                                        <div className="hidden lg:flex flex-col gap-8">
                                            <div>
                                                <h1 className="font-headingSecondary font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em]">
                                                    {heading}
                                                </h1>
                                            </div>
                                            <div className="relative pl-8">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                                                <div className="space-y-6 max-w-2xl">
                                                    <p className="font-medium text-xl md:text-2xl text-text-50 leading-relaxed">
                                                        {subheading}
                                                    </p>
                                                    <p className="font-light text-lg text-text-200 leading-relaxed">
                                                        {description}
                                                    </p>
                                                    <div className="pt-4 flex gap-4">
                                                        <Button
                                                            className="h-12 px-8 rounded-full bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50 font-medium tracking-wide transition-all duration-500 ease-out hover:scale-105 shadow-lg shadow-brand-900/20"
                                                            onClick={() => router.push("/collaboration/register")}
                                                        >
                                                            Register Now
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile/Tablet View (Accordion) */}
                                        <div className="lg:hidden w-full">
                                            <Accordion type="single" collapsible className="w-full flex flex-col gap-4" defaultValue="overview">
                                                <AccordionItem value="overview" className="border-none">
                                                    <AccordionTrigger className="hover:no-underline py-2">
                                                        <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em] text-left">
                                                            {heading}
                                                        </h1>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="relative pl-6 mt-2 flex flex-col gap-6">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                                                            <p className="font-medium text-lg text-text-50 leading-relaxed">
                                                                {subheading}
                                                            </p>
                                                            <p className="font-light text-lg text-text-200 leading-relaxed">
                                                                {description}
                                                            </p>
                                                            <div className="pt-2">
                                                                <Button
                                                                    className="w-full h-12 rounded-full bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50 font-medium tracking-wide transition-all duration-500 ease-out hover:scale-105 shadow-lg shadow-brand-900/20"
                                                                    onClick={() => router.push("/collaboration/register")}
                                                                >
                                                                    Register Now
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grid Section */}
                        <div className="w-full lg:max-w-[35vw]">
                            <div className="grid grid-cols-2 gap-4 auto-rows-[minmax(100px,auto)]">
                                {items.map((item, index) => {
                                    const isStateOne = selectedId === null
                                    const isIntroActive = introStep <= index
                                    const introClass = isIntroActive ? "opacity-0 translate-y-12 blur-lg" : "opacity-100 translate-y-0 blur-0"
                                    const scaleClass = !isStateOne || introStep < totalIntroSteps ? "scale-100" : hoveredId === item.id ? "scale-[1.03]" : hoveredId === null ? "scale-100" : "scale-95 opacity-60 blur-[1px]"

                                    // Vertical Pillars Layout (2 cols, items span 2 rows height-wise)
                                    // Mobile: Stacked or Side-by-side? User said "Seluruh grid berukuran 2x2".
                                    // Let's make it 2 columns on all screens to be safe, or at least md+.
                                    // But on mobile 2 cols might be tight. Let's stick to md+ for 2 cols.
                                    // Actually, user said "Baris 1... Baris 2...", implying a 2x2 grid structure.
                                    // To achieve "vertical" look, we make them tall.

                                    const bentoClass = "col-span-1 row-span-2 aspect-[3/5]"

                                    return (
                                        <div key={item.id}
                                            className={`transition-all duration-700 ease-premium transform-gpu w-full ${bentoClass} ${introClass} ${scaleClass} ${introStep < totalIntroSteps ? "pointer-events-none" : ""}`}
                                            onMouseEnter={() => introDone && setHoveredId(item.id)}
                                            onMouseLeave={() => introDone && setHoveredId(null)}>
                                            {(() => {
                                                const Icon = item.icon as LucideIcon
                                                return (
                                                    <div
                                                        className="group relative rounded-3xl overflow-hidden cursor-pointer h-full glass-card shadow-2xl focus:outline-none focus-visible:outline-none"
                                                        onClick={() => handleCardClick(item.id)}
                                                        tabIndex={-1}
                                                    >
                                                        {/* Hover Glow */}
                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-glass-bg-hover to-transparent" />

                                                        {/* CMS Image (Primary) */}
                                                        {useCMSImages && item.imageUrl ? (
                                                            <div className="absolute inset-0">
                                                                <Image
                                                                    src={item.imageUrl}
                                                                    alt={item.altText || item.label || "JUARA Collaboration"}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-background-900/60 to-background-950/80" />
                                                        )}

                                                        {/* Content */}
                                                        <div className="absolute inset-0 flex flex-col justify-between p-8">
                                                            <div className="flex justify-end">
                                                                <div className="p-3 rounded-full bg-glass-bg border border-glass-border group-hover:bg-glass-bg-hover transition-colors duration-300">
                                                                    <Icon className="h-6 w-6 text-text-50 opacity-80 group-hover:text-text-50 group-hover:opacity-100 transition-colors duration-300" strokeWidth={1.5} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-medium text-text-50 tracking-wide group-hover:text-text-50 transition-colors duration-300 leading-tight">{item.label}</h3>
                                                                <p className="text-sm text-text-200 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                                    Click to view details
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                )}

                {selectedId && selectedItem && (
                    <div className="w-full min-h-[50vh] animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="w-full max-w-4xl mx-auto bg-background-800 border border-white/10 shadow-2xl rounded-3xl relative overflow-hidden p-8 md:p-12">
                            {/* Diagonal Glass Effect Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none z-0" />

                            <div className="relative z-10">
                                <Button
                                    variant="ghost"
                                    className="absolute top-6 right-6 text-text-400 hover:text-white"
                                    onClick={handleCloseDetail}
                                >
                                    Close
                                </Button>

                                <div className="flex flex-col gap-6">
                                    <div className="p-4 rounded-2xl bg-brand-500/10 w-fit">
                                        <selectedItem.icon className="h-10 w-10 text-brand-500" />
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-headingSecondary font-bold text-text-50">
                                        {detailMap[selectedItem.slug]?.title || selectedItem.label}
                                    </h2>

                                    <p className="text-xl text-text-200 leading-relaxed">
                                        {detailMap[selectedItem.slug]?.paragraphs?.[0] || selectedItem.description}
                                    </p>

                                    {selectedItem.slug === "partnership-guide" && (
                                        <div className="pt-6 border-t border-white/10 mt-6">
                                            <h3 className="text-lg font-bold text-text-50 mb-4">What&apos;s Inside</h3>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {["Step-by-step Registration", "Required Documents Checklist", "Verification Process", "Benefits & Tiers"].map((req, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-text-200">
                                                        <CheckCircle2 className="h-5 w-5 text-brand-500 flex-shrink-0" />
                                                        <span>{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="pt-8">
                                                <Button
                                                    className="h-12 px-8 rounded-full bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50 font-medium tracking-wide transition-all duration-500 ease-out hover:scale-105 shadow-lg shadow-brand-900/20"
                                                    onClick={() => window.open("/documents/partnership-guide.pdf", "_blank")}
                                                >
                                                    Download Guide PDF
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {selectedItem.slug === "chat-jett" && (
                                        <div className="pt-6 border-t border-white/10 mt-6">
                                            <h3 className="text-lg font-bold text-text-50 mb-4">Chat with JETT AI</h3>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {["Instant answers about requirements", "Check application status", "Technical support", "General inquiries"].map((req, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-text-200">
                                                        <CheckCircle2 className="h-5 w-5 text-brand-500 flex-shrink-0" />
                                                        <span>{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="pt-8 flex gap-4">
                                                <Button
                                                    className="h-12 px-8 rounded-full bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50 font-medium tracking-wide transition-all duration-500 ease-out hover:scale-105 shadow-lg shadow-brand-900/20"
                                                    onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                                                >
                                                    Start Chatting
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
