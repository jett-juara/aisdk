# About Page Redesign Implementation Plan
## 2-State Layout dengan CompaniesGrid + SVGs

---

## 📋 OVERVIEW

Transform current single-row grid (4 cards in row) menjadi 2-state layout system:

### STATE 1 (No Selection) - Initial State
**Desktop (lg+):**
- Layout: 2 columns (flex)
- LEFT: 4 cards dalam 2×2 grid (grid-cols-2)
- RIGHT: 4 SVGs dalam vertical stack
- Cards: aspect-square, full scale, normal opacity

**Mobile/Tablet (<lg):**
- Layout: Single column (flex-col)
- Cards di atas, SVGs di bawah
- Cards: grid-cols-2 (2 columns per row)
- SVGs: vertical stack

### STATE 2 (Card Selected)
**All Screen Sizes:**
- Layout: Single column (flex-col)
- Cards: aspect-[32/9] (rectangular landscape)
- Selected card: scale-100, opacity-100
- Other cards: scale-75, opacity-30
- SVG Section: Show ONLY 1 SVG (mapped to selected card)
- Content: Expanded description below SVG

---

## 🔧 DETAILED CHANGES

### 1. State Management Updates

**File:** `companies-grid.tsx`

**Current State:**
```typescript
const [selectedId, setSelectedId] = useState<number | null>(null)
```

**New State:**
```typescript
const [selectedId, setSelectedId] = useState<number | null>(null)
```

**Additional Logic Needed:**
- SVG mapping berdasarkan selectedId:
  - id: 1 (Events) → event-txt.svg
  - id: 2 (Community) → community-txt.svg
  - id: 3 (Tech) → tech-txt.svg
  - id: 4 (Analytics) → analytics-txt.svg
  - null → show all 4 SVGs (STATE 1)

### 2. Layout Structure Changes

**Current Structure:**
```jsx
<div className="flex flex-col items-center justify-center gap-6 w-full max-w-7xl px-4">
  <div className="grid grid-cols-4 gap-6 w-full">
    {/* 4 cards in single row */}
  </div>
  {selectedCompany && (
    <div className="w-full grid grid-cols-4 gap-6">
      {/* expandable content */}
    </div>
  )}
</div>
```

**New Structure (STATE 1 - No Selection):**
```jsx
<div className="flex flex-col items-center justify-center gap-6 w-full max-w-7xl px-4">
  {/* Desktop: 2 columns | Mobile: single column */}
  <div className="flex flex-col lg:flex-row gap-6 w-full">
    {/* LEFT: Cards Grid */}
    <div className="lg:w-1/2 w-full">
      <div className="grid grid-cols-2 gap-6">
        {/* 4 cards in 2x2 grid */}
      </div>
    </div>
    
    {/* RIGHT: SVGs Stack (Desktop only) */}
    <div className="hidden lg:flex lg:w-1/2 flex-col gap-6">
      {/* 4 SVGs vertically stacked */}
    </div>
  </div>
  
  {/* Mobile/Tablet: SVGs below cards */}
  <div className="lg:hidden flex flex-col gap-6">
    {/* 4 SVGs vertically stacked */}
  </div>
</div>
```

**New Structure (STATE 2 - Selected):**
```jsx
<div className="flex flex-col items-center justify-center gap-6 w-full max-w-7xl px-4">
  {/* Cards Section */}
  <div className="flex flex-col gap-6 w-full">
    <div className="grid grid-cols-2 gap-6">
      {/* 4 cards (aspect-[32/9] for all) */}
    </div>
  </div>
  
  {/* Selected SVG Section */}
  <div className="w-full">
    {/* Single SVG (mapped to selected card) */}
  </div>
  
  {/* Expandable Content */}
  {selectedCompany && (
    <div className="w-full">
      {/* expanded description */}
    </div>
  )}
</div>
```

### 3. SVG Rendering Logic

**New Component for SVGs:**
```typescript
const SVGStack = ({ selectedId }: { selectedId: number | null }) => {
  const svgMap = {
    1: { src: "/images/about-page/event-txt.svg", alt: "JUARA Events" },
    2: { src: "/images/about-page/community-txt.svg", alt: "JUARA Community" },
    3: { src: "/images/about-page/tech-txt.svg", alt: "JUARA Tech" },
    4: { src: "/images/about-page/analytics-txt.svg", alt: "JUARA Analytics" }
  }
  
  if (selectedId) {
    // STATE 2: Show only selected SVG
    const svg = svgMap[selectedId as keyof typeof svgMap]
    return (
      <div className="w-full flex justify-center">
        <img src={svg.src} alt={svg.alt} className="h-auto max-h-96 object-contain" />
      </div>
    )
  }
  
  // STATE 1: Show all 4 SVGs stacked
  return (
    <div className="flex flex-col gap-6">
      {Object.entries(svgMap).map(([id, svg]) => (
        <div key={id} className="w-full flex justify-center">
          <img src={svg.src} alt={svg.alt} className="h-auto max-h-24 object-contain" />
        </div>
      ))}
    </div>
  )
}
```

### 4. CSS Classes Modifications

**Card Container Changes:**
- **Current:** `grid grid-cols-4 gap-6`
- **STATE 1:** `grid grid-cols-2 gap-6` (both desktop left column dan mobile)
- **STATE 2:** `grid grid-cols-2 gap-6` (maintain 2 columns untuk readability)

**Card Aspect Ratio:**
- **STATE 1:** `aspect-square`
- **STATE 2:** `aspect-[32/9]` (untuk semua cards)

**Layout Container:**
- **Current:** `flex flex-col`
- **STATE 1:** `lg:flex-row flex-col` (desktop 2 columns, mobile stacked)
- **STATE 2:** `flex-col` (always single column)

**New Container Classes:**
```jsx
{/* STATE 1 Desktop */}
<div className="hidden lg:flex lg:flex-row gap-6">
  <div className="lg:w-1/2">
    <div className="grid grid-cols-2 gap-6">
      {/* cards */}
    </div>
  </div>
  <div className="lg:w-1/2">
    <SVGStack selectedId={null} />
  </div>
</div>

{/* STATE 1 Mobile/Tablet */}
<div className="flex lg:hidden flex-col gap-6">
  <div className="w-full">
    <div className="grid grid-cols-2 gap-6">
      {/* cards */}
    </div>
  </div>
  <div className="w-full">
    <SVGStack selectedId={null} />
  </div>
</div>

{/* STATE 2 All Screens */}
{selectedId && (
  <div className="flex flex-col gap-6">
    <div className="w-full">
      <div className="grid grid-cols-2 gap-6">
        {/* cards */}
      </div>
    </div>
    <div className="w-full">
      <SVGStack selectedId={selectedId} />
    </div>
  </div>
)}
```

### 5. Responsive Breakpoints

**Breakpoint Strategy:**
- **lg (1024px+):** Desktop 2-column layout
- **< lg (0-1023px):** Mobile/Tablet single column

**Responsive Behavior:**

| Screen Size | STATE 1 Layout | STATE 2 Layout |
|-------------|----------------|----------------|
| **lg+ (Desktop)** | 2 columns: Cards LEFT, SVGs RIGHT | Single column: Cards + SVG + Content |
| **md (768-1023px)** | Single column: Cards TOP, SVGs BOTTOM | Single column: Cards + SVG + Content |
| **sm (<768px)** | Single column: Cards TOP, SVGs BOTTOM | Single column: Cards + SVG + Content |

**Grid Column Strategy:**
- **STATE 1:** Always grid-cols-2 (consistent 2×2 grid)
- **STATE 2:** Always grid-cols-2 (maintain readability, cards wider)

### 6. Component Interaction Flow

**Click Handler (Same as Current):**
```typescript
const handleCardClick = (id: number) => {
  if (selectedId === id) {
    setSelectedId(null) // Unselect jika klik lagi
  } else {
    setSelectedId(id) // Select card baru
  }
}
```

**State Transition Logic:**

1. **Initial Load (No Selection):**
   - Render STATE 1 layout
   - Cards: aspect-square, scale-100, opacity-100
   - Show all 4 SVGs di right side (desktop) atau bottom (mobile)

2. **Card Clicked:**
   - State changes to STATE 2
   - Layout switches to single column
   - Cards: aspect-[32/9] untuk semua cards
   - Selected card: scale-100, opacity-100
   - Other cards: scale-75, opacity-30
   - Show only 1 SVG (mapped to selected card)
   - Show expanded content below SVG

3. **Click Same Card (Unselect):**
   - State reset to null
   - Revert to STATE 1 layout
   - Cards: aspect-square kembali
   - Show all 4 SVGs again

### 7. Animation & Transition

**Maintain Existing Animations:**
- Card hover effects: `hover:brightness-110`
- Card scale transitions: `transition-all duration-700 ease-out`
- Content expand: `animate-expandContent`

**New Transitions Needed:**
- Layout transition between STATE 1 → STATE 2
- SVG visibility transitions
- Container width changes (lg:w-1/2 ↔ w-full)

**CSS Transition Classes:**
```css
/* Add to component */
<div className="transition-all duration-500 ease-in-out">
  {/* content */}
</div>
```

### 8. File Modifications Summary

#### **companies-grid.tsx** (Major Changes)
- [ ] Add SVG mapping object
- [ ] Create SVGStack component
- [ ] Restructure layout untuk STATE 1 (desktop 2-column)
- [ ] Restructure layout untuk STATE 1 (mobile single column)
- [ ] Add STATE 2 layout (selected card)
- [ ] Update card container classes (grid-cols-4 → grid-cols-2)
- [ ] Update card aspect ratio logic
- [ ] Add responsive visibility classes (hidden lg:flex, lg:hidden, etc.)
- [ ] Add layout transition classes

#### **company-card.tsx** (No Changes Needed)
- Props tetap sama
- Styling tetap sama
- Logic handleClick tetap sama

#### **about/page.tsx** (No Changes Needed)
- Import structure tetap sama
- ThemeProvider tetap sama

---

## 🧪 TESTING CHECKLIST

### Functional Testing

#### STATE 1 (No Selection)
- [ ] **Desktop (lg+):**
  - [ ] Cards appear in 2×2 grid (LEFT side)
  - [ ] SVGs appear in vertical stack (RIGHT side)
  - [ ] Cards are aspect-square
  - [ ] All cards have normal opacity (no dimming)
  - [ ] All SVGs visible (event, community, tech, analytics)
  - [ ] Cards responsive at different desktop sizes
  
- [ ] **Mobile/Tablet (<lg):**
  - [ ] Cards appear in 2×2 grid
  - [ ] SVGs appear below cards (vertical stack)
  - [ ] Cards are aspect-square
  - [ ] Layout stacks vertically (flex-col)
  - [ ] All SVGs visible below cards

#### STATE 2 (Card Selected)
- [ ] **All Screen Sizes:**
  - [ ] Layout becomes single column (flex-col)
  - [ ] All cards become aspect-[32/9]
  - [ ] Selected card: scale-100, opacity-100
  - [ ] Other cards: scale-75, opacity-30
  - [ ] Only 1 SVG visible (mapped to selected card)
  - [ ] Expanded content appears below SVG
  
- [ ] **SVG Mapping Accuracy:**
  - [ ] Card 1 (Events) → event-txt.svg
  - [ ] Card 2 (Community) → community-txt.svg
  - [ ] Card 3 (Tech) → tech-txt.svg
  - [ ] Card 4 (Analytics) → analytics-txt.svg

#### Unselect Functionality
- [ ] Click selected card again → returns to STATE 1
- [ ] All cards revert to aspect-square
- [ ] All SVGs visible again
- [ ] No expanded content

### Responsive Testing

#### Breakpoint: lg (1024px)
- [ ] **STATE 1:**
  - [ ] Layout: 2 columns (cards left, SVGs right)
  - [ ] Width distribution: lg:w-1/2 each
  - [ ] Cards: 2×2 grid
  - [ ] SVGs: vertical stack, right side
  
- [ ] **STATE 2:**
  - [ ] Layout: single column
  - [ ] Cards: 2×2 grid, rectangular
  - [ ] Single SVG below cards

#### Breakpoint: md (768-1023px)
- [ ] **STATE 1:**
  - [ ] Layout: single column, stacked
  - [ ] Cards: 2×2 grid
  - [ ] SVGs: vertical stack below cards
  
- [ ] **STATE 2:**
  - [ ] Layout: single column
  - [ ] Cards: 2×2 grid, rectangular
  - [ ] Single SVG below cards

#### Breakpoint: sm (<768px)
- [ ] **STATE 1:**
  - [ ] Layout: single column, stacked
  - [ ] Cards: 2×2 grid (might overflow, test)
  - [ ] SVGs: vertical stack below cards
  - [ ] Text readable
  
- [ ] **STATE 2:**
  - [ ] Layout: single column
  - [ ] Cards: rectangular, may be wide
  - [ ] Single SVG below cards
  - [ ] Content readable

### Animation Testing
- [ ] **Card Hover Effects:**
  - [ ] Hover brightness increase works
  - [ ] Smooth transition (duration-300)
  
- [ ] **Card Click Animation:**
  - [ ] Scale transition smooth (duration-700)
  - [ ] Opacity transition smooth
  - [ ] Aspect ratio transition smooth
  
- [ ] **Layout Transitions:**
  - [ ] STATE 1 → STATE 2 transition smooth
  - [ ] STATE 2 → STATE 1 transition smooth
  - [ ] No layout shift/jank

### Visual Testing

#### Typography & Spacing
- [ ] Card text readable in both aspect ratios
- [ ] SVG alt text correct
- [ ] Spacing consistent (gap-6)
- [ ] Padding/margins correct

#### Color & Theming
- [ ] Auth theme colors preserved
- [ ] Gradients render correctly
- [ ] Dark mode compatibility
- [ ] Hover states visible

#### Image Quality
- [ ] SVGs crisp and clear
- [ ] SVGs maintain aspect ratio
- [ ] No pixelation/blur
- [ ] Proper object-fit/contain

### Performance Testing
- [ ] **Build:**
  - [ ] TypeScript: zero errors
  - [ ] ESLint: no warnings
  - [ ] Production build: successful
  
- [ ] **Runtime:**
  - [ ] No console errors
  - [ ] No layout shifts (CLS < 0.1)
  - [ ] Smooth animations (60fps)
  - [ ] No memory leaks

### Accessibility Testing
- [ ] **Keyboard Navigation:**
  - [ ] Cards focusable (tab)
  - [ ] Enter/Space activates card
  - [ ] Focus indicators visible
  
- [ ] **Screen Reader:**
  - [ ] Alt text on SVGs descriptive
  - [ ] Card labels announced
  - [ ] State changes announced
  
- [ ] **Visual:**
  - [ ] Contrast ratio > 4.5:1
  - [ ] Text scalable to 200%
  - [ ] No motion-sensitive effects (or has prefers-reduced-motion)

### Browser Compatibility
- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)

### Edge Cases
- [ ] Rapid card clicking (no state conflicts)
- [ ] Browser window resize during animation
- [ ] Mobile orientation change (portrait ↔ landscape)
- [ ] SVG loading failure fallback
- [ ] Very long descriptions (overflow handling)

---

## 📦 FILES TO MODIFY

### Modified Files
1. **companies-grid.tsx** - Primary implementation
   - Layout restructure
   - SVG rendering logic
   - State management updates
   - Responsive classes

### Unchanged Files
1. **company-card.tsx** - No changes needed
2. **about/page.tsx** - No changes needed

### New Assets Used
- /images/about-page/event-txt.svg
- /images/about-page/community-txt.svg
- /images/about-page/tech-txt.svg
- /images/about-page/analytics-txt.svg

---

## ⏱️ ESTIMATED COMPLETION TIME

- **Layout Restructure:** 30-45 minutes
- **SVG Integration:** 20-30 minutes
- **Responsive Testing:** 30-45 minutes
- **Bug Fixes:** 20-30 minutes
- **Documentation Update:** 10-15 minutes

**Total: ~1.5-2.5 hours**

---

## 🚨 CRITICAL NOTES

1. **Breakpoint Consistency:**
   - lg untuk desktop 2-column
   - < lg untuk mobile single column
   - Test di exact breakpoint (1024px)

2. **State Transition:**
   - STATE 1 ↔ STATE 2 must be smooth
   - No layout jump or flash
   - Preserve animations

3. **SVG Loading:**
   - Check file paths correct
   - Verify SVG files exist
   - Test alt text accessibility

4. **Grid Consistency:**
   - Always grid-cols-2 (2×2 grid)
   - aspect-square → aspect-[32/9] transition
   - Cards stay in 2 columns even when rectangular

5. **Unselect Behavior:**
   - Clicking same card = unselect
   - Must revert to STATE 1 completely
   - All cards aspect-square kembali

---

## 🎯 SUCCESS CRITERIA

✅ Desktop (lg+): STATE 1 = 2 columns (cards LEFT, SVGs RIGHT)
✅ Mobile: STATE 1 = single column (cards TOP, SVGs BOTTOM)
✅ All screens: STATE 2 = single column (cards + selected SVG + content)
✅ SVG mapping 100% accurate
✅ Zero TypeScript errors
✅ Smooth animations
✅ Fully responsive
✅ All tests passing

