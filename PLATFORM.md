# ARM Optics CRM — Platform Documentation

> **Purpose:** This document describes the ARM Optics SaaS CRM platform in full. It is intended for use with AI tools for idea generation, feature planning, and architectural discussions.

---

## Overview

ARM Optics CRM is a production-ready SaaS platform built for an Australian optical shop. It replaces paper-based order forms and manual customer tracking with a full-featured web application covering staff operations and a customer self-service portal.

**Problem solved:** The shop had no digital system — no order tracking, no customer history, no reminders. Everything was on paper.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL + Auth + Storage + Edge Functions + RLS) |
| Styling | Tailwind CSS — custom charcoal/red brand palette |
| Forms | React Hook Form + Zod |
| Email | Resend API |
| Inventory Sync | GenSoft MoneyWorks (via Supabase Edge Function) |
| UI Primitives | Radix UI, Lucide React icons |
| Toasts | Sonner |

---

## Brand & Design System

- **Font:** Manrope (single typeface throughout)
- **Color palette:** Charcoal grays (`brand-900` = `#1a1a1a`, `brand-600` = `#454545`) + red accent (`#d93226`) from the ARM logo
- **Theme:** Light only
- **Card style:** `bg-white border border-brand-100 rounded-lg shadow-sm`
- **Buttons:** `bg-brand-900 text-white` (default), `bg-accent` red (accent/CTA)
- **Sidebar:** White background, active nav item = `bg-brand-900` with red dot indicator
- **Status badges:** Solid light colors (amber/blue/green/purple/red)

---

## Architecture

### Auth Model (Two-Tier)

1. **Staff** — authenticated via Supabase Auth, linked to `staff_profiles` table. All staff queries are gated by the `is_staff()` RLS helper function.
2. **Portal users (customers)** — authenticated via Supabase Auth, linked to `customers.portal_user_id`. Can only see their own data.

### Route Structure

```
(auth)     /login, /reset-password, /update-password
(staff)    /dashboard, /customers/*, /orders/*, /prescriptions, /inventory, /reminders, /settings
(portal)   /portal-login, /portal, /portal/orders, /portal/prescriptions
API        /api/auth/callback, /api/auth/signout, /api/orders/[id]/notify-ready
```

---

## Database Schema

### Tables

#### `staff_profiles`
Staff user accounts and roles.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK, linked to auth.users |
| full_name | text | |
| role | enum | admin, optometrist, dispenser, receptionist |
| email | text | |
| phone | text | |
| is_active | boolean | |

#### `customers`
Customer profiles.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| first_name, last_name | text | |
| date_of_birth | date | |
| email, phone, mobile | text | |
| address_line1, address_line2, suburb, state, postcode | text | |
| country | text | Default: Australia |
| medicare_number, dva_number | text | |
| health_fund_name, health_fund_number, health_fund_ref | text | |
| notes | text | |
| portal_user_id | UUID | Links to auth.users (optional — grants portal access) |
| gensoft_customer_id | text | External GenSoft ID |
| search_vector | tsvector | Full-text search (name, email, phone, suburb) |

#### `prescriptions`
Optical prescription records per customer.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| customer_id | UUID | FK → customers |
| prescription_type | enum | distance, near, bifocal, progressive, contact_lens |
| exam_date | date | Required |
| next_exam_date | date | |
| prescribing_optom | text | |
| od_sph, od_cyl, od_axis, od_add, od_va | numeric/int | Right eye spectacle Rx |
| os_sph, os_cyl, os_axis, os_add, os_va | numeric/int | Left eye spectacle Rx |
| pd_distance_right, pd_distance_left | numeric | Distance pupillary distance |
| pd_near_right, pd_near_left | numeric | Near pupillary distance |
| pd_single | numeric | Single (monocular) PD |
| cl_od_brand, cl_od_base_curve, cl_od_diameter, cl_od_power, cl_od_cylinder, cl_od_axis | text/numeric | Right contact lens |
| cl_os_* | text/numeric | Left contact lens (same fields) |
| notes | text | |
| recorded_by | UUID | FK → staff_profiles |

#### `orders`
Optical orders (spectacles, contact lenses, accessories).

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| order_number | text | Auto-generated: ARM-YYYY-#####  |
| customer_id | UUID | FK → customers (RESTRICT delete) |
| prescription_id | UUID | FK → prescriptions (optional snapshot reference) |
| status | enum | pending, in_progress, lab_sent, ready, collected, cancelled |
| order_date | date | |
| collection_date | date | Expected pickup |
| lens_od_sph, lens_od_cyl, lens_od_axis, lens_od_add | text | Rx snapshot at time of order (OD) |
| lens_os_sph, lens_os_cyl, lens_os_axis, lens_os_add | text | Rx snapshot (OS) |
| pd_distance_right, pd_distance_left, pd_near_right, pd_near_left, pd_single | text | PD snapshot |
| frame_supplier, frame_brand, frame_model, frame_colour, frame_size | text | Frame details |
| frame_gensoft_sku | text | GenSoft product SKU |
| lens_type, lens_material, lens_coating, lens_supplier | text | Lens details |
| lens_gensoft_sku | text | GenSoft product SKU |
| services | JSONB | Array of `{name, price}` |
| accessories | JSONB | Array of `{name, sku, qty, price}` |
| total_price | numeric | Required |
| deposit_paid | numeric | Amount received |
| balance_due | numeric | Computed: total_price − deposit_paid |
| lab_name, lab_order_ref, lab_sent_date | text/date | Lab tracking |
| customer_acknowledged | boolean | Customer reviewed/agreed |
| acknowledged_at | timestamptz | |
| notes | text | Customer-visible |
| internal_notes | text | Staff-only |
| created_by, updated_by | UUID | FK → staff_profiles |

#### `order_status_history`
Audit log — auto-populated by trigger on every status change.

| Field | Type | Notes |
|---|---|---|
| order_id | UUID | FK → orders (CASCADE) |
| from_status, to_status | enum | Status transition |
| changed_by | UUID | FK → staff_profiles |
| notes | text | |

#### `reminders`
Scheduled email/notification records.

| Field | Type | Notes |
|---|---|---|
| customer_id | UUID | FK → customers (CASCADE) |
| order_id | UUID | FK → orders (SET NULL) |
| reminder_type | enum | glasses_ready, exam_due, custom |
| status | enum | scheduled, sent, failed, cancelled |
| scheduled_at | timestamptz | When to send |
| sent_at | timestamptz | Actual send time |
| recipient_email, recipient_phone | text | |
| subject, body | text | Email content |
| error_message | text | If failed |
| created_by | UUID | FK → staff_profiles |

#### `gensoft_products`
Product inventory cached from GenSoft MoneyWorks.

| Field | Type | Notes |
|---|---|---|
| sku | text | UNIQUE |
| name, category, supplier | text | |
| cost_price, sell_price | numeric | |
| stock_qty | integer | |
| is_active | boolean | |
| raw_data | JSONB | Original API response |
| synced_at | timestamptz | |
| search_vector | tsvector | Full-text search |

### Database Functions & Triggers

| Name | Purpose |
|---|---|
| `set_updated_at()` | Auto-updates `updated_at` on every row change |
| `update_customer_search_vector()` | Maintains full-text search index (name, email, phone, suburb) |
| `update_gensoft_search_vector()` | Maintains product search index |
| `generate_order_number()` | Auto-generates `ARM-YYYY-#####` on insert |
| `log_order_status_change()` | Auto-logs status transitions to `order_status_history` |
| `order_balance_due()` | Calculates balance (total_price − deposit_paid) |
| `is_staff()` | RLS helper — returns true if authenticated user has an active staff_profile |

---

## Features

### Staff Module

#### Dashboard
- Time-of-day greeting with staff name
- KPI cards: Total Customers, Pending Orders, Ready for Collection, Orders Today
- Recent Orders table (8 latest): order number, customer name/phone, total, deposit, dates, status

#### Customers
- **List:** Search by name/phone/email (full-text + trigram fuzzy), paginated (20/page)
- **Profile:** Contact details, health fund/Medicare, notes, address
- **Edit:** All profile fields
- **Prescriptions tab:** List of exam records, add new prescription via modal
- **Orders tab:** All orders for customer

#### Orders
- **List:** Filter by status (All / Pending / In Progress / Lab Sent / Ready / Collected), paginated (25/page)
- **New order:** Customer search → 4-tab form (Rx+Lenses, Frame+Accessories, Pricing+Lab, Notes)
- **Order detail:** Full view, status updater, customer acknowledgement tracking
- **Edit:** All order fields
- **Print:** Print-optimised layout using CSS `@media print` (no Puppeteer)
- **Status change to "ready":** Auto-sends "glasses ready" email to customer and logs reminder

#### Prescriptions
- Global list of all prescriptions across all customers

#### Inventory
- View cached GenSoft product catalog

#### Reminders
- List all reminders (50 latest): type, customer, email, scheduled date, sent date, status icon
- Reminders are processed automatically by Supabase Edge Function cron (every 15 minutes)

#### Settings
- **Profile:** View name, email, role, member since
- **GenSoft integration:** Status + env var instructions
- **Email config:** Resend env vars + enabled features
- **Staff management (admin only):** List all staff with role + active status

### Customer Portal

#### Portal Login
- Supabase Auth — customers log in with email/password

#### Portal Dashboard
- Welcome with customer name and contact details
- Recent orders (last 5): order number, date, status badge, frame/lens summary, total, balance
- Latest prescription: Rx table (OD/OS), PD, next exam date

#### Portal Orders
- Full order history with status badges, frame/lens details, pricing, customer-visible notes

#### Portal Prescriptions
- Full prescription history: Rx tables, PD, next exam date, prescribing optometrist

---

## Order Workflow

```
pending → in_progress → lab_sent → ready → collected
                                          ↑
                              Email auto-sent here

Any status → cancelled
```

- **Status audit:** Every transition is logged to `order_status_history` (who, when, from/to)
- **Glasses ready trigger:** Changing status to `ready` → calls `/api/orders/[id]/notify-ready` → sends Resend email → creates `reminders` record
- **Rx snapshot:** Orders store a copy of the prescription at order creation, independent of the customer's prescription record
- **Customer acknowledgement:** Staff can mark that the customer has reviewed and agreed to the order

---

## Notification System

### Email (Resend)
- **Glasses ready:** Sent automatically when order status → `ready`
  - Subject: "Your glasses are ready – {orderNumber}"
  - From: `EMAIL_FROM` env var (default: `noreply@armoptics.com.au`)
- **Exam due reminders:** Processed by Supabase Edge Function cron (every 15 min)
- **Custom reminders:** Can be created manually

### SMS
- Planned for Phase 2 (not yet implemented)

---

## Integrations

### GenSoft MoneyWorks
- **Purpose:** Sync optical product inventory (frames, lenses, accessories) into the CRM
- **Mechanism:** Supabase Edge Function (`gensoft-sync`) polls the MoneyWorks API and upserts to `gensoft_products`
- **Data stored:** SKU, name, category, supplier, cost price, sell price, stock qty, raw JSON
- **Order reference:** Frame SKU and lens SKU stored on orders; accessory SKUs in JSONB array
- **Search:** Full-text + trigram search over product name, SKU, supplier, category

### Supabase Edge Functions
| Function | Purpose |
|---|---|
| `send-email-reminder` | Processes scheduled reminders, sends emails via Resend |
| `gensoft-sync` | Polls GenSoft API, refreshes `gensoft_products` table |

---

## Form Structure (Key Fields)

### Order Form (4 tabs)

**Tab 1 — Prescription & Lenses**
- Spectacle Rx (OD & OS): SPH, CYL, AXIS, ADD
- Pupillary Distance: R dist, L dist, R near, L near, Single
- Lens product: Type, Material, Coating, Supplier, GenSoft SKU

**Tab 2 — Frame & Accessories**
- Frame: Brand, Model/Style, Colour, Size, Supplier, GenSoft SKU
- Services (dynamic): Name + Price per service
- Accessories (dynamic): Name + SKU + Qty + Price per accessory

**Tab 3 — Pricing & Lab**
- Dates: Order Date, Estimated Collection Date
- Status dropdown
- Pricing: Total Price, Deposit Paid, Balance Due (calculated)
- Lab: Lab Name, Lab Order Ref, Date Sent to Lab
- Acknowledgement checkbox

**Tab 4 — Notes**
- Customer Notes (visible in portal)
- Internal Notes (staff only)

### Customer Form
- Personal: First Name, Last Name, DOB, Email, Phone, Mobile
- Address: Street, Line 2, Suburb, State (AU states), Postcode
- Health: Medicare Number, DVA Number, Health Fund Name, Member Number, Reference

### Prescription Form
- Type, Exam Date, Next Exam Date, Prescribing Optometrist
- Spectacle Rx (OD/OS): SPH, CYL, AXIS, ADD, VA
- PD: 5 fields (dist R/L, near R/L, single)
- Contact Lens (if type = contact_lens): Brand, Base Curve, Diameter, Power, Cylinder, Axis per eye

---

## Validation (Zod Schemas)

- **Order:** `customer_id` required, `order_date` required, `total_price` ≥ 0, `deposit_paid` ≥ 0, Rx fields as strings (converted to numbers on submit), services/accessories as typed arrays
- **Customer:** `first_name` + `last_name` required, `email` optional with format check, country defaults to "Australia"
- **Prescription:** `exam_date` required, Rx strings coerced to `numeric | null` (empty string → null), axis coerced to `int | null`

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@armoptics.com.au

# GenSoft MoneyWorks
GENSOFT_API_URL=http://your-moneyworks-server:6710
GENSOFT_API_USER=
GENSOFT_API_PASSWORD=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Codebase Key Files

```
supabase/migrations/
  00001_initial_schema.sql      Tables, enums, constraints
  00002_functions_triggers.sql  DB functions and triggers
  00003_indexes.sql             Query optimization indexes
  00004_rls_policies.sql        Row-level security policies

supabase/functions/
  send-email-reminder/          Cron-driven email sender
  gensoft-sync/                 MoneyWorks product sync

src/lib/
  validations/order.ts          Zod schema for orders
  validations/customer.ts       Zod schema for customers
  validations/prescription.ts   Zod schema for prescriptions
  email.ts                      Resend email helper
  utils.ts                      Formatters, constants, cn()

src/types/database.ts           TypeScript interfaces for all DB tables

src/components/
  orders/OrderForm/
    index.tsx                   Main order form (tabbed)
    LensSection.tsx             Tab 1: Rx + lens
    FrameSection.tsx            Tab 2: Frame + accessories
    PricingSection.tsx          Tab 3: Pricing + lab
  customers/
    CustomerForm.tsx            Customer create/edit form
    CustomerSearchBar.tsx       Search widget used in order form

src/app/
  (staff)/dashboard/page.tsx
  (staff)/customers/page.tsx
  (staff)/customers/[id]/page.tsx
  (staff)/customers/[id]/edit/page.tsx
  (staff)/customers/[id]/prescriptions/
  (staff)/orders/page.tsx
  (staff)/orders/new/page.tsx
  (staff)/orders/[id]/page.tsx
  (staff)/orders/[id]/edit/page.tsx
  (staff)/orders/[id]/print/page.tsx
  (staff)/orders/[id]/OrderStatusUpdater.tsx
  (staff)/reminders/page.tsx
  (staff)/settings/page.tsx
  (portal)/portal/page.tsx
  (portal)/portal/orders/page.tsx
  (portal)/portal/prescriptions/page.tsx
  api/orders/[id]/notify-ready/route.ts
```

---

## Current Status (MVP — March 2026)

All staff and portal pages are implemented:
- Customer management (create, view, edit)
- Order management (create, view, edit, print, status tracking)
- Prescription records (create, view per customer or globally)
- Customer portal (orders + prescriptions self-service)
- Email notifications (glasses ready)
- GenSoft product sync
- Scheduled reminder processing

**Needs to run:** Supabase project credentials in `.env.local`

---

## What's Not Yet Built (Phase 2 Ideas)

- SMS notifications (mentioned in settings as planned)
- Exam due reminder automation (Edge Function exists but scheduling not confirmed)
- Bulk actions on orders/customers
- Reporting / analytics beyond dashboard KPIs
- Payment processing integration
- Online booking / appointment scheduling
- Portal: ability for customers to request appointments
- Staff calendar / scheduling
- Multi-location / multi-branch support
- Document uploads (e.g. scanned referral letters)
- GenSoft two-way sync (write orders back to MoneyWorks)
