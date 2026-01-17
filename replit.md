# CLUNY CAFE – نظام إدارة المقاهي الرقمي الشامل
**CLUNY SYSTEMS – Employee Portal**

---

## 🎨 Rebranding Info (December 31, 2025)
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

### 🚀 MENU PAGE REDESIGN - COMPLETED (January 2026)
- ✅ Implemented modern interactive menu with group filtering
- ✅ Restored Muted Sage color palette and system background
- ✅ Re-implemented item grouping logic (grouping by base name)
- ✅ Fixed image loading fallback from database
- ✅ Added search functionality and featured items slider
- ✅ Integrated PWA install button and floating cart summary
- ✅ Maintained compatibility with existing AddToCartModal and CartStore

### 🚀 TABLE RESERVATION SYSTEM - COMPLETED (January 2026)
- ✅ Time-based table occupancy: Tables now show as occupied only within reservation window
- ✅ Reservation activates 30 minutes BEFORE scheduled time
- ✅ Auto-expiry 5 minutes AFTER scheduled time if customer doesn't arrive
- ✅ Reservation creation no longer marks table as immediately occupied
- ✅ Staff can extend reservations (autoExpiryTime) and expiry respects extensions
- ✅ OrderCard component displays table number and order time for employees

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

### Sprint 2 - Employee Portal & Permissions (December 31, 2025)
- **Page-Level Permissions:** PageGuard component for granular access control
- **Employee Data Model:** Includes `allowedPages` field for customizable page access
- **PWA Configuration:** Separate manifests for customer and employee portals
- **Dynamic Manifest Switching:** Automatically switches between CLUNY CAFE and CLUNY SYSTEMS based on route

### Technical Stack
- **Backend:** Node.js, Express.js, MongoDB with Mongoose, Zod for validation
- **Frontend:** React, TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Wouter
- **Security:** AuthGuard (role-based), PageGuard (page-level permissions), local storage for session management

## Key Components
- **PageGuard.tsx** - Controls access to specific pages based on employee's `allowedPages` field
- **AuthGuard.tsx** - Enhanced to read allowedPages from employee data
- **manifest.json** - Customer portal PWA configuration with CLUNY CAFE branding
- **employee-manifest.json** - Employee portal PWA configuration with CLUNY SYSTEMS branding
- **index.html** - Dynamic manifest and favicon switching based on route

## How Page Permissions Work
1. Admin/Owner/Manager have access to all pages
2. Regular employees can only access pages listed in their `allowedPages` array
3. Wrap employee routes with `<PageGuard requiredPage="page-name">` to enforce permissions
4. If employee lacks permission, they're redirected to /unauthorized

## Deployment
- Built with npm + Vite
- Express backend serves on port 5000
- Production: `npm run build` then `node ./dist/index.cjs`
- PWA works offline with service worker registration
