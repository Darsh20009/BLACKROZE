# CLUNY CAFE – Digital Coffee Shop Management System

## Overview

CLUNY CAFE is a comprehensive digital management system designed to streamline operations for coffee shops. It caters to both customers through the CLUNY CAFE portal and employees via the CLUNY SYSTEMS portal. The system aims to modernize coffee shop management, enhance customer experience, and improve operational efficiency. Key capabilities include integrated ERP accounting, ZATCA-compliant invoicing, robust delivery management, employee shift and geofencing, and a customer loyalty program.

## User Preferences

- All texts are in Arabic with English support for data.
- The system fully supports RTL.
- Iterative development approach.
- Work in Fast mode with small, focused chunks.

## System Architecture

### Design System (CLUNY)

The system employs a modern, clean design inspired by Noon Food, featuring a vibrant teal green primary color (`#2D9B6E`) and ocean blue accent (`#2196F3`) against a pure white background. Typography uses Playfair Display for headings and Inter for body text, with Cairo as a fallback for Arabic.

**Core Design Elements:**
- **Color Palette:** Muted Sage (`#9FB2B3`), Rich Coffee Brown (`#B58B5A`).
- **Typography:** Playfair Display (headings), Inter (body), Tajawal/IBM Plex Sans Arabic (Arabic).
- **Layouts:** Four distinct role-based layouts (Customer, POS, Kitchen, Manager).
- **States:** Unified components for loading (skeletons), empty, and error states.

### Technical Implementations

- **POS Order Alerts & Management:** Real-time order alerts with notification sounds via WebSocket, sound/alert toggles with persistence, new orders badge counter, split-screen view toggle, enhanced live orders dialog with details panel, color-coded status borders, and order actions (start, ready, complete, cancel).
- **Business Mode System:** Supports configurable "cafe only," "restaurant only," or "both" modes, with dynamic menu filtering and real-time status indicators.
- **ERP Accounting System:** Features a professional Chart of Accounts following Saudi standards, double-entry bookkeeping, journal entry management, and financial reports (Trial Balance, Income Statement, Balance Sheet). Includes expense management with approval workflows and vendor management.
- **ZATCA Professional Invoicing:** Generates ZATCA-compliant invoices with TLV encoded QR codes containing mandatory fields, integrated into order creation and standalone invoice generation.
- **Financial Reports Dashboard:** Interactive visualizations for revenue vs. expenses, asset/liability distribution, and income statement breakdowns using `recharts`.
- **Kitchen Display System (KDS):** Enhanced with SLA status tracking, priority badges, station routing, allergen warnings, prep time countdowns, and estimated total prep times.
- **Loyalty Program:** Tier progress visualization (Bronze, Silver, Gold, Platinum) with progress bars and upgrade information. Unified `useLoyaltyCard` hook for consistent data management and offline sync.
- **Menu Page Redesign:** Interactive menu with group filtering, search functionality, featured items slider, and PWA installation support. Products are now grouped by `groupId` for proper variant handling.
- **Promotional Offers System:** Bundle/combo offers with original and discounted pricing, displayed prominently in "عروضنا" section. Supports time-based activation with start/end dates.
- **Enhanced Addons System:** Supports both general addons (available for all products) and specific addons (linked to individual products via `CoffeeItemAddon`). The add-to-cart modal displays specific addons first, then general addons.
- **Table Reservation System:** Time-based table occupancy, with reservations activating 30 minutes before and expiring 5 minutes after scheduled time. Staff can extend reservations.
- **Checkout Page:** Includes discount code input, order confirmation dialog with accurate totals, and split payment options.
- **Delivery System:** Manages external delivery platform integrations, geospatial delivery zones (polygon/radius-based), driver tracking, and order status tracking with ETA.
- **Driver Portal & Tracking:** Driver login with phone-based authentication, order queue management, status updates, customer tracking page with real-time updates via WebSockets.
- **Branch Geofencing:** Configurable `geofenceRadius` and `geofenceBoundary` (polygon-based) for precise attendance and location-based management. Includes manager notifications for employee alerts.
- **Shift Management:** Supports flexible shift scheduling, including overnight shifts, and employee assignment to shifts.
- **Employee Permissions (RBAC):** Granular, page-level access control using `allowedPages` in employee profiles and a `PageGuard` component.
- **PWA Configuration:** Dynamic manifest switching between CLUNY CAFE (customer) and CLUNY SYSTEMS (employee) based on the route.

### Technical Stack

- **Backend:** Node.js, Express.js, MongoDB with Mongoose, Zod.
- **Frontend:** React, TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Wouter.
- **Security:** AuthGuard (role-based), PageGuard (page-level permissions), local storage for session management.

## External Dependencies

- **Database:** MongoDB Atlas (CLUNY-CAFE Project)
- **Mapping/Geospatial:** `turf.js` for polygon-based geofencing.
- **Charting:** `recharts` for financial dashboards.
- **Delivery Platforms (Integrations):** Noon Food, Hunger Station, Keeta, Marsool, Careem.
- **QR Code Generation:** `zatca-utils.ts` (custom utility module).