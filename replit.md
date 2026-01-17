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

### 🚀 ERP ACCOUNTING SYSTEM - COMPLETED (January 2026)
- ✅ Professional Chart of Accounts with Saudi standard structure (Assets 1xxx, Liabilities 2xxx, Equity 3xxx, Revenue 4xxx, Expenses 5xxx)
- ✅ Double-entry bookkeeping with automatic balance validation
- ✅ Journal entry creation and posting with fiscal period validation
- ✅ Financial reports: Trial Balance, Income Statement, Balance Sheet
- ✅ Expense management with approval workflow (draft → pending_approval → approved → paid)
- ✅ Vendor management with VAT number tracking
- ✅ Automatic order-to-journal posting for sales transactions
- ✅ Interactive Chart of Accounts tree view with collapsible hierarchy
- ✅ Dashboard with KPIs (revenue, expenses, net income, cash balance)
- ✅ Guards against double posting and locked fiscal periods
- ✅ Route: /erp/accounting

### 🚀 ZATCA PROFESSIONAL INVOICING - COMPLETED (January 2026)
- ✅ ZATCA-compliant TLV (Tag-Length-Value) encoding for QR codes
- ✅ Base64 QR code generation with 5 mandatory fields (seller name, VAT number, timestamp, total, VAT amount)
- ✅ Invoice creation from orders with automatic ZATCA QR code generation
- ✅ Standalone invoice creation with line items and VAT calculations
- ✅ Invoice listing with status badges (draft, issued, paid, etc.)
- ✅ Invoice detail dialog with ZATCA QR code display
- ✅ Saudi VAT number validation (15-digit format starting and ending with 3)
- ✅ API endpoints: GET/POST /api/erp/invoices, GET /api/erp/invoices/:id, PATCH /api/erp/invoices/:id/status
- ✅ zatca-utils.ts utility module for TLV encoding and QR generation

### 🚀 FINANCIAL REPORTS DASHBOARD - COMPLETED (January 2026)
- ✅ Interactive bar chart for Revenue vs Expenses comparison
- ✅ Pie chart visualization for Assets/Liabilities distribution (Cash, Receivables, Payables)
- ✅ Income statement breakdown chart showing revenue and expenses by category
- ✅ Charts built with recharts library with Arabic labels and RTL support
- ✅ Responsive design adapting to different screen sizes

### 🚀 KITCHEN DISPLAY SYSTEM (KDS) ENHANCEMENTS - COMPLETED (January 2026)
- ✅ Added SLA status tracking with color-coded borders (on-track=normal, warning=amber, overdue=red)
- ✅ Priority badges for rush/VIP orders when metadata available
- ✅ Station routing badges showing kitchen station assignments
- ✅ Allergen warning display for items with allergen metadata
- ✅ Prep time remaining countdown for in-progress orders
- ✅ Estimated total prep time calculations based on item count
- ✅ Graceful fallback when backend doesn't provide prep metadata (uses elapsed time heuristics)

### 🚀 LOYALTY TIER PROGRESS - COMPLETED (January 2026)
- ✅ Tier progress visualization showing percentage to next tier
- ✅ Defined tier thresholds: Bronze (0-499), Silver (500-1499), Gold (1500-4999), Platinum (5000+)
- ✅ Progress bar with SAR amount remaining for upgrade
- ✅ Platinum tier celebration display for max-level customers
- ✅ Enhanced useLoyaltyCard hook with lastSyncedAt timestamp and offline sync infrastructure
- ✅ Graceful degradation when tier data not available from backend

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

### 🚀 LOYALTY CARD DATA UNIFICATION - COMPLETED (January 2026)
- ✅ Created unified `useLoyaltyCard` hook as single source of truth for loyalty card data
- ✅ Hook uses React Query with setQueryData for immediate cache updates (no stale UI)
- ✅ Centralized syncAllStorages function manages localStorage and profile storage synchronization
- ✅ Manual card lookups update query cache via updateCardInCache
- ✅ Removed all direct localStorage.setItem calls from components
- ✅ Consistent loyalty card display across payment methods, profile, and card pages

### 🚀 CHECKOUT PAGE IMPROVEMENTS - COMPLETED (January 2026)
- ✅ Added discount code input field with validation UI
- ✅ Added confirmation dialog before order creation
- ✅ Confirmation dialog shows accurate totals including discounts and free drinks
- ✅ Shows secondary payment method for Qahwa-card split payments
- ✅ Proper calculation matching backend order total

### 🚀 BUG FIXES - COMPLETED
- ✅ Fixed drink creation silently failing - removed strict branchId requirement
- ✅ Added fallback values for missing tenantId and branchId (demo-tenant, default-branch)
- ✅ Fixed table status API - now correctly reflects database occupancy
- ✅ Added proper logging for debugging drink and table operations
- ✅ Emergency fallback for fetching all items when tenant-specific query fails

### 🚀 BRANCH GEOFENCING SYSTEM - COMPLETED (January 2026)
- ✅ Added `geofenceRadius` field to Branch schema (default 200 meters)
- ✅ Added `lateThresholdMinutes` field to Branch schema (default 15 minutes)
- ✅ Added `managerId` field for linking branch to manager
- ✅ Created ManagerNotification model for employee alerts (late check-in, leaving branch, no check-in)
- ✅ Updated admin-branches UI to capture geofencing configuration (lat/lng, radius, late threshold)
- ✅ Added working hours configuration to branch form
- ✅ **Polygon-based boundaries**: Added `geofenceBoundary` field for precise branch territory definition
- ✅ Interactive map component (`BranchPolygonPicker`) for drawing custom polygon boundaries
- ✅ Point-in-polygon validation using turf.js `booleanPointInPolygon` for accurate attendance checks
- ✅ Graceful fallback to radius-based check when no polygon boundary is defined
- ✅ Undo/clear functionality for polygon editing in admin UI

### 🚀 SHIFT MANAGEMENT SYSTEM - COMPLETED (January 2026)
- ✅ Created IShift model with start/end time, break duration, overnight shift support
- ✅ Created IEmployeeShiftAssignment model for assigning employees to shifts by day of week
- ✅ Proper compound indexes for efficient querying

### 🚀 EMPLOYEE PERMISSIONS (RBAC) - IN PROGRESS
- ✅ Added `permissions` and `allowedPages` arrays to Employee schema
- 🔄 Next: Create UI for assigning page-level permissions to employees
- 🔄 Next: Integrate with PageGuard component for enforcement

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
