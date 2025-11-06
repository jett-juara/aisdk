# BASELINE REPORT - Homepage Viewport Refactor

**Date**: 2025-11-07 06:58 WIB
**Branch**: master
**Rollback Branch**: rollback-homepage-viewport
**Status**: READY FOR REFACTOR

---

## 📊 **CURRENT STATE SUMMARY**

### **Files to Modify**
1. `/Users/eriksupit/Desktop/juarajett/src/app/page.tsx` (line 7)
2. `/Users/eriksupit/Desktop/juarajett/src/components/homepage/homepage-section.tsx` (line 13)
3. `/Users/eriksupit/Desktop/juarajett/src/components/layout/footer.tsx` (line 25)

### **TypeScript Baseline**
- ✅ **TypeScript**: ZERO ERRORS
- ✅ **Compilation**: SUCCESS
- ✅ **Build Time**: 8.2s
- ✅ **Pages Generated**: 27/27 (static) + 13 (dynamic)

---

## 🔍 **DETAILED CODE ANALYSIS**

### **FILE 1: page.tsx**

**Current Implementation (line 7)**:
```tsx
<div className="h-screen bg-black overflow-hidden relative">
```

**Analysis**:
- `h-screen` = 100vh (fixed height)
- `overflow-hidden` = prevents vertical scrolling
- `relative` = positioning context

**Issues Identified**:
- Fixed height causes content overflow di small devices
- Overflow-hidden doesn't prevent content dari being larger than viewport
- No flexbox stacking untuk natural flow

**Planned Changes**:
```tsx
<div className="min-h-screen bg-black flex flex-col relative">
```

**Expected Impact**:
- Content can grow beyond viewport (natural)
- Flexbox enables proper stacking
- Removes artificial height constraint

---

### **FILE 2: homepage-section.tsx**

**Current Implementation (line 13)**:
```tsx
<section className="absolute inset-0 flex items-center justify-center overflow-hidden bg-auth-bg-form">
```

**Analysis**:
- `absolute inset-0` = covers entire parent container
- `overflow-hidden` = clip content to container
- Z-index: default (0)

**Issues Identified**:
- Absolute positioning脱离 normal flow
- Depends on parent height (h-screen)
- Footer overlap karena absolute positioning
- Content constrained by parent viewport

**Planned Changes**:
```tsx
<section className="flex-1 flex items-center justify-center overflow-hidden bg-auth-bg-form">
```

**Expected Impact**:
- Flex-1 takes available space (not fixed)
- Natural flow dalam flexbox parent
- No dependency on specific viewport height
- Better responsive behavior

---

### **FILE 3: footer.tsx**

**Current Implementation (line 23-25)**:
```tsx
const Footer = ({ className = "", fixed = true }: FooterProps) => {
  return (
    <footer className={`${fixed ? 'fixed inset-x-0 bottom-0 z-40' : 'relative'} ${className}`}>
```

**Analysis**:
- Default: `fixed inset-x-0 bottom-0 z-40`
- Fixed to bottom dengan high z-index
- Always visible (overlay behavior)

**Issues Identified**:
- Fixed positioning overlaps content di mobile
- Z-40 higher than content (z-0)
- Not dalam normal document flow
- Pushes content up when visible

**Planned Changes**:
```tsx
<footer className={`${fixed ? 'relative mt-auto' : 'relative'} ${className}`}>
```

**Expected Impact**:
- Relative positioning dalam document flow
- Mt-auto pushes to bottom naturally
- No overlap with content
- Better responsive behavior

---

## 🎯 **ROOT CAUSE ANALYSIS**

### **Primary Issue: Structural Layout Conflict**

```
┌─────────────────────────┐
│  page.tsx (h-screen)     │  ← Fixed 100vh height
│  ┌───────────────────┐  │
│  │ Header            │  │
│  │ (64px)            │  │
│  ├───────────────────┤  │
│  │                    │  │
│  │ HomepageSection   │  │  ← absolute inset-0
│  │ (100vh - 144px)   │  │     (constrained)
│  │                    │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Footer            │  │  ← fixed bottom-0
│  │ (~80px, z-40)     │  │     (OVERLAP!)
│  └───────────────────┘  │
└─────────────────────────┘
```

**Problem Flow**:
1. Page has fixed 100vh height
2. HomepageSection absolute to fill parent
3. Footer fixed to bottom (independent of flow)
4. Total height: 100vh + footer height = OVERFLOW
5. CTA buttons di bottom get covered

---

## 📏 **VIEWPORT ANALYSIS**

### **iPhone SE (375×667) - CRITICAL**
```
Viewport: 375×667
Header:   64px
Footer:   ~80px
Content:  ~650px (estimated)
Total:    794px
Overflow: 127px (19% oversize)

CTA Position: ~600px
Footer Start: ~587px
OVERLAP: 13px (CRITICAL ZONE)
```

### **iPhone 12 (390×844) - MEDIUM**
```
Viewport: 390×844
Header:   64px
Footer:   ~80px
Content:  ~700px (estimated)
Total:    844px
Overflow: 0px (fits but tight)

CTA Position: ~700px
Footer Start: ~764px
No overlap but tight spacing
```

### **iPad (768×1024) - LOW**
```
Viewport: 768×1024
Header:   64px
Footer:   ~80px
Content:  ~700px (estimated)
Total:    844px
Buffer:   180px (good spacing)
```

---

## ✅ **BASELINE QUALITY METRICS**

### **TypeScript & Build**
- ✅ **Zero TypeScript errors**
- ✅ **Build successful** (8.2s)
- ✅ **27 static pages generated**
- ✅ **13 dynamic routes ready**

### **Expected Metrics After Refactor**
- TypeScript: Should remain zero errors
- Build time: Expected similar (7-9s)
- Page count: Should remain same
- Performance: Expected improvement (less layout shift)

---

## 🛡️ **ROLLBACK STRATEGY**

### **Rollback Branch**: `rollback-homepage-viewport`
- Created at start of Phase 0
- Contains exact state before refactor
- Can restore dengan:
  ```bash
  git checkout rollback-homepage-viewport
  git reset --hard HEAD~N  # to any rollback point
  ```

### **Rollback Points per Phase**
- **Rollback 1A**: After page.tsx changes
- **Rollback 1B**: After page.tsx testing
- **Rollback 1C**: After page.tsx refinement
- **Rollback 2A**: After homepage-section.tsx changes
- **Rollback 2B**: After CTA fix
- **Rollback 2C**: After homepage-section testing
- **Rollback 3A**: After footer.tsx changes
- **Rollback 3B**: After footer testing
- **Rollback 3C**: After cross-browser testing

---

## 📋 **REFACTOR PLAN CONFIRMATION**

### **Timeline**: 6.5 jam total
- Phase 0: Preparation - 0.5 jam ✅ COMPLETE
- Phase 1: page.tsx - 1.5 jam
- Phase 2: homepage-section.tsx - 1.5 jam
- Phase 3: footer.tsx - 1.5 jam
- Phase 4: Comprehensive Testing - 1.5 jam
- Phase 5: Final Validation - 1.0 jam

### **Risk Assessment**: MEDIUM
- **Files Modified**: 3 core files
- **Breaking Changes**: Structural layout changes
- **Mitigation**: Comprehensive rollback strategy
- **Testing**: Extensive cross-device verification

### **Success Criteria**
- [ ] CTA buttons fully accessible di all mobile devices
- [ ] No unnecessary scrollbar di mobile
- [ ] Footer tidak overlap content
- [ ] Performance score maintained >90
- [ ] Zero TypeScript errors
- [ ] Visual design preserved 100%

---

## 🚀 **NEXT STEPS**

**Proceeding to Phase 1**: page.tsx container refactor
- Change `h-screen` → `min-h-screen`
- Add `flex flex-col` untuk proper stacking
- Remove `overflow-hidden` (test impact)
- **Milestone 1A**: Initial changes
- **Milestone 1B**: Testing & validation
- **Milestone 1C**: Refinement

**Ready untuk execute. All baseline documented. Rollback branch active.**

---

**Report Generated**: 2025-11-07 06:58 WIB
**Status**: READY FOR PHASE 1 EXECUTION
