# 🏆 WORKSPACE3 QUALITY STANDARDS

## 📱 UI/UX STANDARDS (Instagram/TikTok Level)

### 🎨 Design
- **Typography**: 16-18px body, 24-32px headings (Instagram standard)
- **Spacing**: 8px/16px/24px/32px grid system (TikTok spacing)
- **Colors**: High contrast, WCAG AA minimum (4.5:1 text, 3:1 UI)
- **Shadows**: Subtle depth `0 2px 8px rgba(0,0,0,0.1)` (Duolingo style)
- **Border Radius**: 12px cards, 8px buttons (Instagram standard)
- **Animations**: 200-300ms smooth transitions (TikTok feel)

### ⚡ Performance (Netflix/Spotify Level)
- **First Paint**: < 1.5s (Instagram loads in 1.2s)
- **Interactive**: < 3s (TikTok video ready in 2.5s)
- **Smooth**: 60fps animations, no jank (YouTube smoothness)
- **Lighthouse Score**: > 90 performance, > 90 accessibility

### 📱 Responsive
- **Touch Targets**: 44x44px minimum (Apple HIG)
- **Mobile First**: Works perfect on 375px width (iPhone SE)
- **Tablet**: Optimized for 768px and 1024px
- **Desktop**: Max width 1440px, centered

## 💻 CODE STANDARDS

### 🏗️ Architecture (Airbnb/Google Level)
- **Component Size**: < 250 lines (Airbnb standard)
- **Function Size**: < 50 lines (Google style)
- **DRY**: No duplicate code, reuse components
- **Single Responsibility**: One component = one purpose

### 🎯 Best Practices
- **TypeScript**: Full type safety, no `any`
- **Error Handling**: Try/catch all async, user-friendly errors
- **Loading States**: Show spinners, never blank screens
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## ✅ QUALITY GATES (MUST PASS ALL)

### Gate 1: Visual Quality
- [ ] Looks as good as Instagram/TikTok
- [ ] All spacing matches 8px grid
- [ ] Typography is 16-18px body, 24-32px headings
- [ ] Colors have sufficient contrast (WCAG AA)

### Gate 2: Functionality
- [ ] All buttons/links work
- [ ] No console errors
- [ ] Forms validate properly
- [ ] Navigation flows smoothly

### Gate 3: Performance
- [ ] Lighthouse score > 90
- [ ] Page load < 3s
- [ ] Animations at 60fps
- [ ] No layout shift (CLS < 0.1)

### Gate 4: Code Quality
- [ ] Components < 250 lines
- [ ] Functions < 50 lines
- [ ] No duplicate code
- [ ] Full TypeScript types

### Gate 5: Accessibility
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA

### Gate 6: Testing
- [ ] Playwright tests pass --headless
- [ ] Visual regression tests pass
- [ ] No runtime errors in console
- [ ] Works on mobile/tablet/desktop

## 🔍 VERIFICATION PROCESS

1. **WebSearch**: Compare against latest trends and benchmarks
2. **Playwright**: Screenshot our app vs competitors
3. **Read**: vision.md alignment check
4. **GitHub MCP**: Search best practices and examples
5. **Lighthouse**: Run performance audit

## 🎯 REFERENCE APPS

- **Instagram**: UI/UX inspiration, typography, spacing
- **TikTok**: Performance, animations, scrolling feed
- **Duolingo**: Shadows, colors, gamification
- **Netflix**: Performance benchmarks
- **Spotify**: Smooth interactions

**IF ANY GATE FAILS → FIX BEFORE COMMIT**
