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
- **Gift Cards System**: Full CRUD for gift cards including issuance, validation, redemption, transaction history.
- **Employee Scheduling**: Shift management and assignment system for weekly scheduling.
- **Purchase Orders**: PO workflow from draft → pending → approved → ordered → received with auto-inventory update.
- **Manager Reviews Dashboard**: View, reply, filter customer reviews with statistics.
- **Payroll Management**: Employee payroll report generation at `/manager/payroll`.
- **Geidea Payment Gateway**: Callback and webhook handlers for Geidea card payments.
- **Customer Favorites**: Customers can favorite menu items (POST/DELETE `/api/customers/favorites`).
- **Loyalty Free Drink Claim**: `/api/loyalty/claim-free-drink` endpoint.
- **Bulk Order Delete**: Manager can bulk delete orders via `/api/orders/bulk`.
- **Advanced Analytics**: `/api/analytics/advanced` and `/api/analytics/cogs` endpoints.
- **Cashier Layouts**: Three layout options (Classic, POS, Split) for employee cashier page via `cashier-layouts.tsx`.
- **Menu Layouts**: Three layout options (Classic, Cards, List) for customer menu via `menu-layouts.tsx`.
- **Public Loyalty Settings**: `/api/public/loyalty-settings` for frontend loyalty config display.
- **Employee-Specific PWA**: Dedicated `employee-manifest.json` for tailored staff portal experience.
- **Payment Gateway Management System**: Admin can select NeoLeap or Geidea, enter encrypted credentials, and toggle payment methods.
- **Secure Online Payment Flow**: PCI compliant checkout using hosted redirects and server-side verification.
- **Config-Driven Payment Methods**: `/api/payment-methods` endpoint returns enabled methods dynamically based on admin configuration.
- **Loyalty Points Redemption Security**: Email verification codes required for points redemption.
- **Complete i18n Translation System**: All customer menu text uses i18n keys for Arabic and English, with dynamic switching for categories, banners, and UI labels.
- **Automated Email Notifications**: Daily end-of-day report email at 23:59 Riyadh time (cron in server/index.ts); Inventory low-stock alert email every 2 hours when items hit minStock. Both configurable via Admin Settings email cards.
- **Email Configuration UI**: Admin Settings has a new "إعدادات الإشعارات البريدية" card with separate fields for daily-report emails and inventory-alert emails, persisted in BusinessConfig as `dailyReportEmails` and `inventoryAlertEmails` arrays.
- **Tax Invoice Order Number Badge**: Prominent black-background badge at the top of printed tax invoices shows the order number at 28px; invoice number and table number shown with larger bold fonts.
- **POS Product Images**: Removed heavy hover scale animation from product card images for better performance.
- **Mobile "More" Menu**: Fixed SheetContent to use flex column layout with overflow-y-auto so all menu items scroll correctly.
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
- **Kitchen Display Scheduled Orders**: KDS tracks `scheduledPickupTime` and `preparationHoldUntil` fields on orders; a 30-second tick re-evaluates which scheduled orders are on hold vs. due for preparation. Sound/toast alerts fire when prep time arrives; a dedicated "مجدول" tab separates held orders from active queue.
- **Image Library Modal**: Shared drink image library (`ImageLibraryModal.tsx`) with `/api/drink-images` GET endpoint; managers can upload or reuse existing images when adding/editing menu items. Integrates into both Add and Edit dialogs in employee-menu-management.tsx.
- **PIN Field in Loyalty Transfer**: Transfer points dialog in my-card.tsx now includes an optional PIN security field, matching CLUNY parity.
- **Favorites System Fix**: Fixed silent error swallowing in `toggleFavoriteMutation` (menu.tsx) — raw fetch now checks `r.ok` and throws on failure, with `onError` toast. Backend auto-creates a minimal `CustomerModel` entry when a customer (with localStorage data) toggles a favorite but doesn't yet exist in MongoDB. DELETE favorites returns success (not 404) for missing customers. Hardcoded Arabic toast replaced with `t('menu.login_to_favorite')` and `t('menu.favorite_failed')`.
- **Reviews System Fix**: Removed `requireAuth` from `POST /api/reviews` so customers can submit product ratings. The endpoint now accepts `customerId`/`customerPhone`/`customerName` from request body and falls back to `'guest'` if no auth. `product-reviews.tsx` updated to pass customer context info in the mutation payload.
- **my-orders.tsx i18n**: All hardcoded Arabic strings in the order review section (rate button, experience prompt, placeholder, submit, cancel, success/error toasts) replaced with `t()` calls using new `orders.review_*` i18n keys in both EN and AR.

### Technical Stack

- **Backend:** Node.js, Express.js, MongoDB with Mongoose, Zod.
- **Frontend:** React, TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Wouter.
- **Security:** AuthGuard (role-based), PageGuard (page-level permissions), local storage for session management.

## External Dependencies

- **Database:** MongoDB Atlas (CLUNY-CAFE Project)
- **Mapping/Geospatial:** `turf.js`
- **Charting:** `recharts`
- **Delivery Platforms (Integrations):** Noon Food, Hunger Station, Keeta, Marsool, Careem.

## Replit Migration Notes

- Dev script uses `node_modules/.bin/tsx` explicitly to ensure tsx is resolved correctly in Replit's shell environment.
- Sensitive credentials (MONGODB_URI, VAPID_PRIVATE_KEY) are stored as Replit Secrets; non-sensitive config (VAPID_PUBLIC_KEY, VAPID_SUBJECT) are stored as shared environment variables.
- Server listens on port 5000 which maps to external port 80.
- Deployment build outputs to `dist/index.js` (ESM format).