## Overview

BLACK ROSE CAFE (مؤسسة الوردة السوداء) is a comprehensive digital management system for coffee shop operations. The system serves customers via the Black Rose Cafe portal and employees via BLACK ROSE SYSTEMS. Key capabilities include integrated ERP accounting, ZATCA-compliant invoicing, robust delivery management, employee shift and geofencing, and a customer loyalty program (بطاقة بلاك روز). Business info: VAT 312718675800003, CR 4700114396, Location: Yanbu, Domain: www.blackrose.com.sa.

## User Preferences

- All texts are in Arabic with English support for data.
- The system fully supports RTL.
- Iterative development approach.
- Work in Fast mode with small, focused chunks.

## System Architecture

### Design System (CLUNY)

The system employs a modern, clean design inspired by Noon Food, featuring a vibrant teal green primary color (`#2D9B6E`) and ocean blue accent (`#2196F3`) against a pure white background. Typography uses Playfair Display for headings and Inter for body text, with Cairo as a fallback for Arabic. Core design elements include a muted sage and rich coffee brown color palette, and distinct role-based layouts (Customer, POS, Kitchen, Manager) with unified components for loading, empty, and error states.

### Technical Implementations

The system features real-time POS order alerts and management via WebSockets, supporting configurable business modes (cafe, restaurant, both), and an ERP Accounting System with a professional Chart of Accounts following Saudi standards, double-entry bookkeeping, and financial reports. It includes ZATCA-compliant invoicing with TLV encoded QR codes, a Kitchen Display System (KDS) with SLA tracking and allergen warnings, and a points-based Loyalty Program with tier progression and personalized offers.

Other key features include a referral system, an interactive Menu Page redesign with group filtering and PWA support, promotional offers (bundles/combos), an enhanced addons system for both general and specific items, and a Table Reservation System with time-based occupancy. The Checkout Page supports discount codes and split payments. A comprehensive Delivery System manages external platform integrations, geospatial delivery zones, and driver tracking. Employee management includes branch geofencing, flexible shift management, and granular Role-Based Access Control (RBAC) with page-level permissions. PWA configurations dynamically switch manifests between customer and employee portals.

The system also includes:
- **Admin-Configurable Loyalty & Offers System**: Admin can control points-per-SAR ratio, min points for redemption, and loyalty program toggle. Dynamic offers for first order, comeback, frequent customer, special drink, and points redemption are configurable.
- **Discount Codes Management**: Full CRUD for discount codes with type/value/max uses.
- **Dynamic Cluny Card**: Points-per-SAR ratio in customer card page driven by admin config.
- **Rich Push Notification System**: Professional lock-screen notifications for Android/iOS with real-time updates for orders, customer details, and status. Supports contextual actions and RTL.
- **PWA Background Push Notifications**: Service Worker handles push events, background sync for offline orders, and notifications even when the app is closed.
- **Auto Push Subscription**: `useNotifications` hook manages VAPID key exchange and server registration for employees and customers.
- **Employee-Specific PWA**: Dedicated `employee-manifest.json` for tailored staff portal experience.
- **Payment Gateway Management System**: Admin can select NeoLeap or Geidea, enter encrypted credentials, and toggle payment methods.
- **Secure Online Payment Flow**: PCI compliant checkout using hosted redirects and server-side verification.
- **Config-Driven Payment Methods**: `/api/payment-methods` endpoint returns enabled methods dynamically based on admin configuration.
- **Loyalty Points Redemption Security**: Email verification codes required for points redemption.
- **Complete i18n Translation System**: All customer menu text uses i18n keys for Arabic and English, with dynamic switching for categories, banners, and UI labels.
- **Independent Food/Drinks Management**: Employee menu management filters items by type (drinks/food) with separate sidebar links and category selectors.
- **Menu Categories Employee-Managed**: Category add/delete moved to admin settings; categories have a `department` field for drinks/food management.
- **Account Creation Enhancement**: Parent account selector for nested account hierarchy.
- **Enhanced Customer Profile Page**: Profile editing for name and email; phone number display.
- **Fixed Inventory Deduction Bug**: Proper inventory deduction and accounting for `costOfGoods`.
- **Accounting Journal Entries for Purchases**: Automatic double-entry journal entries for inventory receipts.
- **Dynamic Menu Categories**: Custom menu categories/sections with CRUD and tenant scoping.
- **Drink Grouping by First Arabic Word**: Menu groups drinks by the first Arabic word.
- **Drink Addon System**: Drinks can be linked as addons with display in add-to-cart modal.
- **Cart Display Enhancement**: Cart badges show linked drink names and icons.

### Technical Stack

- **Backend:** Node.js, Express.js, MongoDB with Mongoose, Zod.
- **Frontend:** React, TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Wouter.
- **Security:** AuthGuard (role-based), PageGuard (page-level permissions), local storage for session management.

## External Dependencies

- **Database:** MongoDB Atlas (CLUNY-CAFE Project)
- **Mapping/Geospatial:** `turf.js`
- **Charting:** `recharts`
- **Delivery Platforms (Integrations):** Noon Food, Hunger Station, Keeta, Marsool, Careem.
- **QR Code Generation:** `zatca-utils.ts` (custom utility module).