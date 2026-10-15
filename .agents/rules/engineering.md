# REAGENTWATCH ENGINEERING & DESIGN RULES

## 1. Domain Safety Principle (Non-Negotiable)
- **Deterministic Rules are the Safety Floor:** Statistical ML, Vision AI, and LLMs may ELEVATE risk score, but NEVER LOWER a risk score computed by the deterministic chemistry rule engine.
- If a bottle meets criteria for Class A or B peroxide formation past shelf-life, or has visual crystallization reported, its risk level is locked at `critical` (95-100) and CANNOT be downgraded by AI text interpretation.

## 2. Peri-Urban First Design System
- Modern Safety-Tech dark/light design. High contrast for outdoor sunlight or dim laboratory basements.
- Color system:
  - Safe / Compliant: `Emerald-500` (`#10B981`)
  - Warning / Approaching Expiry: `Amber-500` (`#F59E0B`)
  - High Hazard: `Orange-600` (`#EA580C`)
  - Critical Danger: `Rose-600` / `Red-600` (`#E11D48`)
- Touch targets: Minimum 48px x 48px for one-tap teacher mobile use.
- Language support: En, Ta (Tamil), Hi (Hindi) toggles.

## 3. Architecture & Code Quality
- Single source of truth: All entities conform to `types/chemical.ts`.
- Zero unhandled exceptions in scanner or voice inputs.
- Offline-first: IndexedDB persistence via Dexie.js for all bottle events when network is down.
