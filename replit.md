# CLUNY CAFE – نظام إدارة المقاهي الرقمي الشامل
**CLUNY SYSTEMS – Employee Portal**

---

## 🎨 Rebranding Info (December 30, 2025)
- **Brand Name:** CLUNY CAFE (Customer) / CLUNY SYSTEMS (Employee)
- **Primary Color:** #9FB2B3 (Muted Sage/Dusty Blue-Green)
- **Database:** MongoDB Atlas - CLUNY-CAFE Project
- **Typography:** Playfair Display (headings) + Inter (body)

---

## 📋 Overview

CLUNY CAFE is a comprehensive coffee shop management system designed to streamline coffee shop operations. The system serves both customers (through CLUNY CAFE) and employees (through CLUNY SYSTEMS portal).

## User Preferences
- All texts are in Arabic with English support for data.
- The system fully supports RTL.
- Iterative development approach.
- Work in Fast mode with small, focused chunks.

## Current Progress (December 31, 2025)

### 🚀 BUG FIXES - COMPLETED
- ✅ Fixed drink creation silently failing - removed strict branchId requirement
- ✅ Added fallback values for missing tenantId and branchId (demo-tenant, default-branch)
- ✅ Fixed table status API - now correctly reflects database occupancy
- ✅ Added proper logging for debugging drink and table operations
- ✅ Emergency fallback for fetching all items when tenant-specific query fails

### 🚀 REBRANDING PHASE - Phase 1 Complete
- ✅ Updated color system to Muted Sage palette
- ✅ Splash screen redesign with new colors
- ✅ Welcome page (Home page /) redesign - LIVE
- ✅ Navigation bar with new branding
- ✅ Feature cards with coffee brown accents
- ✅ Root route (/) now displays Welcome page
- ⏳ Database migration setup
- ⏳ Logo asset integration (awaiting PNG)
- ⏳ Employee portal (CLUNY SYSTEMS) updates
- ⏳ Menu page and components rebrand

## System Architecture

### Design System (CLUNY)
- **Primary Palette:**
  - `--primary: #9FB2B3` (Muted Sage)
  - `--primary-dark: #6E8A8B`
  - `--primary-light: #C7D6D7`

- **Neutral Palette:**
  - `--background: #F7F8F8`
  - `--surface: #FFFFFF`
  - `--border: #E2E6E6`
  - `--text-main: #1F2D2E`
  - `--text-muted: #6B7C7D`

- **Accent Palette:**
  - `--accent-coffee: #B58B5A` (Rich Coffee Brown)
  - `--accent-warm: #E6D3B1`

- **Typography:**
  - Headings: Playfair Display (serif)
  - Body: Inter (sans-serif)
  - Arabic: Cairo (fallback)

### Sprint 0 - Design System (December 2025)
- **Typography:** Tajawal font for Arabic with IBM Plex Sans Arabic as fallback
- **Role-Based Layouts:** 4 distinct layouts for different user types (Customer, POS, Kitchen, Manager)
- **Loading States:** Specialized skeletons for different sections
- **Empty/Error States:** Unified components with retry functionality

### Sprint 1 - Data Unification (December 2025)
- **Unified Inventory Model:** RawItem is the single source of truth for all inventory
- **Recipe Management:** Uses RecipeItem model linking CoffeeItem to RawItem

### Technical Stack
- **Backend:** Node.js, Express.js, MongoDB with Mongoose, Zod for validation
- **Frontend:** React, TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Wouter

## TODO - What Needs To Be Done
⏳ **Pending Logo Asset:** Need to upload CLUNY CAFE logo PNG for:
  - Splash screen
  - Favicon
  - Welcome page header
  - Brand assets throughout app

⏳ **Brand Text Replacements:** Replace remaining "CLUNY CAFE" references in:
  - Client components (splash.tsx, user-guide.tsx, menu.tsx, etc.)
  - Documentation files
  - Comments and strings

⏳ **Welcome/Home Page Redesign:** Using new colors and typography

⏳ **Git Cleanup:** Remove old cluny references from repository

## Deployment
- Built with npm + Vite
- Express backend serves on port 5000
- Production: `npm run build` then `node ./dist/index.cjs`
