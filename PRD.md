# ARM Optics CRM — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-22
**Status:** Implementation-Ready
**Platform:** SaaS — Next.js 15 + Supabase (PostgreSQL)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Business Goals](#2-business-goals)
3. [User Roles](#3-user-roles)
4. [Permissions and Access Model](#4-permissions-and-access-model)
5. [Core Modules](#5-core-modules)
6. [Detailed Workflows](#6-detailed-workflows)
7. [Digital Order Form Structure](#7-digital-order-form-structure)
8. [Printable Document Requirements](#8-printable-document-requirements)
9. [Customer Portal Requirements](#9-customer-portal-requirements)
10. [Notification and Reminder Requirements](#10-notification-and-reminder-requirements)
11. [GenSoft MoneyWorks Integration Scope](#11-gensoft-moneyworks-integration-scope)
12. [Supabase Architecture Approach](#12-supabase-architecture-approach)
13. [Suggested Database Schema](#13-suggested-database-schema)
14. [Recommended RLS Strategy](#14-recommended-rls-strategy)
15. [MVP Scope](#15-mvp-scope)
16. [Future Phases](#16-future-phases)
17. [Admin and Reporting Needs](#17-admin-and-reporting-needs)
18. [UX/UI Requirements Aligned to ARM Optics Branding](#18-uxui-requirements-aligned-to-arm-optics-branding)

---

## 1. Product Overview

ARM Optics CRM is a private, web-based SaaS platform purpose-built for ARM Optics, an Australian independent optical retail practice. It replaces paper-based order forms, manual prescription filing, and ad-hoc customer tracking with a unified digital system.

The platform serves two distinct audiences operating through a single Next.js 15 application:

- **Staff interface** — A full-featured CRM and order management console accessed by optometrists, dispensers, receptionists, and the business owner. Protected behind Supabase Auth with role-based access.
- **Customer portal** — A read-only self-service interface allowing patients to view their current prescriptions and order history by logging in via a dedicated portal URL.

The system is **not** a point-of-sale, accounting, or inventory management replacement. Its integration with GenSoft MoneyWorks is intentionally limited to product/stock reference lookups only.

**Tech stack (locked):**

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, App Router, `src/` structure |
| Styling | Tailwind CSS, custom dark/gold brand palette |
| Forms | React Hook Form + Zod |
| Backend / DB | Supabase (PostgreSQL 17) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage buckets |
| Edge Functions | Supabase Edge Functions (Deno) |
| Email | Resend API (via edge function) |
| UI Primitives | Radix UI via shadcn/ui |
| Toasts | Sonner |

---

## 2. Business Goals

### Primary Goals

1. **Eliminate paper order forms.** Replace the existing handwritten ARM Optics optical order form with a structured digital equivalent that captures all fields, enforces validation, and produces a print-ready facsimile.

2. **Centralise customer records.** Maintain a single searchable source of truth for each customer: personal details, contact information, Medicare/DVA/health fund data, prescription history, and order history.

3. **Track order lifecycle end-to-end.** Move every order through a defined status pipeline (Pending → In Progress → Lab Sent → Ready → Collected / Cancelled) with full history logging and staff attribution.

4. **Provide patients visibility.** Give customers portal access to their own prescriptions and order status without needing to call the practice.

5. **Automate routine reminders.** Send scheduled email reminders for glasses-ready notifications and eye examination due dates, reducing manual follow-up workload.

6. **Connect to existing stock system.** Look up product SKUs, names, prices, and stock availability from GenSoft MoneyWorks without duplicating accounting functions.

### Secondary Goals

- Reduce errors from manual transcription of prescriptions into order forms.
- Create an auditable history of all changes to orders and customer records.
- Provide the business owner with revenue and operational reporting at a glance.
- Support future expansion to SMS reminders, Medicare claiming workflows, and multi-location practice management.

---

## 3. User Roles

The system defines two top-level actor classes: **Staff** and **Portal Users**.

### Staff Roles

All staff authenticate via `supabase.auth` and have a corresponding row in `staff_profiles`. The `role` column is an enum that controls what actions each staff member may perform.

| Role | Description |
|---|---|
| `admin` | Full system access. Manages staff accounts, system settings, and all records. Typically the business owner or practice manager. |
| `optometrist` | Full access to prescriptions and all clinical data. Can create and view orders but does not manage staff accounts. |
| `dispenser` | Full access to orders, customers, and prescriptions. Core order-entry role. |
| `receptionist` | Can create and search customers, view orders, create reminders. Cannot edit prescriptions or manage staff. |

### Portal User

A patient who has been issued portal credentials by a staff member. Linked to a customer record via `customers.portal_user_id`. Portal users have **read-only** access strictly scoped to their own data.

---

## 4. Permissions and Access Model

### Core Design Principle

All access control is enforced at the database level using **PostgreSQL Row Level Security (RLS)**. No business logic in Next.js server actions may be relied upon as the sole access gate. Supabase RLS is the authoritative boundary.

### Helper Functions (SECURITY DEFINER)

```sql
is_staff()      -- Returns TRUE if auth.uid() maps to an active staff_profiles row
is_admin()      -- Returns TRUE if auth.uid() maps to an active admin staff_profiles row
get_customer_id_for_portal_user()  -- Returns the customer.id linked to the portal user's auth.uid()
```

### Staff Permissions Matrix

| Resource | admin | optometrist | dispenser | receptionist |
|---|---|---|---|---|
| `staff_profiles` | Full CRUD | Read own | Read own | Read own |
| `customers` | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| `prescriptions` | Full CRUD | Full CRUD | Full CRUD | Read only |
| `orders` | Full CRUD | Full CRUD | Full CRUD | Read + Create |
| `order_status_history` | Read | Read | Read | Read |
| `reminders` | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| `gensoft_products` | Read | Read | Read | Read |
| Settings page | Full | None | None | None |

### Portal User Permissions

Portal users may only `SELECT` rows that belong to them:

| Resource | Portal Access |
|---|---|
| `customers` | Own row only (`portal_user_id = auth.uid()`) |
| `prescriptions` | Own records only (via `get_customer_id_for_portal_user()`) |
| `orders` | Own orders only (via `get_customer_id_for_portal_user()`) |
| All other tables | No access |

### Route-Level Guards

- Staff routes live under `/` within the `(staff)` route group and are protected by a Next.js middleware that checks for a valid Supabase session and a matching `staff_profiles` row.
- Portal routes live under `/portal` within the `(portal)` route group and check for a valid session where `portal_user_id` is set on a customer.
- Portal and staff users cannot traverse between groups — a valid staff session cannot access portal routes and vice versa.

---

## 5. Core Modules

### 5.1 Dashboard

A real-time summary view for staff showing:
- Total customer count
- Pending orders count
- Orders ready for collection
- Orders created today
- Chronological feed of recent orders with status badges

### 5.2 Customer Management

- Full-text search by name, phone, email, or suburb using `pg_trgm` and `tsvector`
- Customer profile: personal details, contact info, Medicare, DVA, health fund
- View history: all prescriptions and orders for the customer in reverse chronological order
- Portal access management: generate/revoke portal login credentials
- Notes field for freeform clinical or administrative comments

### 5.3 Prescription Management

- Create and store spectacle prescriptions with full OD/OS Rx fields (SPH, CYL, AXIS, ADD, VA)
- Pupillary distance: binocular distance/near, or single PD
- Support for five prescription types: distance, near, bifocal, progressive, contact lens
- Contact lens specific fields: brand, base curve, diameter, power, cylinder, axis per eye
- Track prescribing optometrist name and next exam due date
- Prescription linked to customer; orders link to a prescription snapshot

### 5.4 Order Management

- Create new orders linked to a customer and optionally to an existing prescription
- Prescription values copied as an immutable snapshot on the order (decoupled from source prescription)
- Full order lifecycle with status pipeline and history
- Frame, lens, services, and accessories line items
- Pricing with total, deposit, and derived balance due
- Lab tracking: lab name, reference number, and sent date
- Customer and internal notes (segregated — internal notes not visible to portal)
- Customer acknowledgement flag with timestamp

### 5.5 Printable Order Document

- Accessible at `/orders/[id]/print`
- Full page A4 optical order form with ARM Optics header
- Separate tear-off customer receipt slip below a dashed cut line
- Print-optimised CSS using `@media print` — no server-side rendering dependency like Puppeteer

### 5.6 Reminders and Notifications

- Schedule email reminders of type: `glasses_ready`, `exam_due`, `custom`
- Status lifecycle per reminder: `scheduled → sent / failed / cancelled`
- Reminder delivery via Resend API through a Supabase Edge Function
- Cron trigger every 15 minutes polls for due reminders

### 5.7 Customer Portal

- Separate login at `/portal-login`
- Dashboard showing most recent prescription and most recent order
- Prescriptions list: all prescriptions in reverse date order
- Orders list: all orders in reverse date order with status
- No write access — purely informational

### 5.8 Inventory / Product Reference

- Searchable list of products cached from GenSoft MoneyWorks
- Displays SKU, name, category, supplier, sell price, stock quantity
- Used during order entry to populate frame or lens SKU fields
- Synced via edge function on a 4-hour cron schedule

### 5.9 Staff Settings

- Admin-only page to manage staff accounts
- Toggle active status, update roles
- Future: practice configuration, email templates, reminder defaults

---

## 6. Detailed Workflows

### 6.1 New Customer Registration

1. Staff navigates to **Customers → New Customer**.
2. Enters: first name, last name, date of birth (optional), phone, mobile, email, address, suburb, state, postcode.
3. Optionally records: Medicare number, DVA number, health fund name, number, and reference.
4. Saves. A `customers` row is created with `created_by` set to the staff member's ID.
5. A full-text search vector is automatically computed by database trigger.

### 6.2 Recording a Prescription

1. Open a customer's profile page.
2. Navigate to **Prescriptions** tab or sub-page.
3. Click **Add Prescription**.
4. Select prescription type (distance / near / bifocal / progressive / contact lens).
5. Enter: exam date, prescribing optometrist, OD and OS fields, PD values.
6. For contact lens type: fill brand, base curve, diameter, power, cylinder, axis per eye.
7. Set optional next exam date (drives exam due reminders).
8. Save. `prescriptions` row created with `recorded_by` set to staff ID.

### 6.3 Creating a New Order

1. Navigate to **Orders → New Order** or from a customer's profile.
2. **Customer selection:** search and select an existing customer. Creating an order requires an existing customer record.
3. **Prescription & Lenses tab:**
   - Optionally select a saved prescription to pre-fill Rx fields.
   - Edit OD/OS SPH, CYL, AXIS, ADD fields as strings (converted to numerics on submit).
   - Enter PD distance (R/L), PD near (R/L), or single PD.
   - Select lens type, material, coating, supplier.
   - Optionally enter a GenSoft SKU via the product search lookup.
4. **Frame & Accessories tab:**
   - Enter frame brand, model, colour, size, supplier.
   - Optionally search GenSoft for frame SKU.
   - Add accessories (free-form name, SKU, quantity, unit price).
   - Add service line items (name, price).
5. **Pricing & Lab tab:**
   - Enter total price and deposit paid; balance due is derived automatically.
   - Set expected collection date.
   - Enter lab name, reference number, and date sent.
6. **Notes tab:**
   - Customer-visible notes.
   - Internal staff-only notes.
7. Submit. Server action inserts the order. Order number auto-generated as `ARM-YYYY-NNNNN`.
8. Status set to `pending`. Status history entry created.

### 6.4 Order Status Progression

```
pending → in_progress → lab_sent → ready → collected
                   ↘                          ↗
                    cancelled (from any active state)
```

- Staff update status from the order detail page using a status selector.
- Every status change is recorded in `order_status_history` with timestamp and the staff member who changed it.
- When status transitions to `ready`, a `glasses_ready` reminder can be automatically scheduled for the linked customer.

### 6.5 Printing an Order

1. Open the order detail page.
2. Click **Print / Open Print View**.
3. New tab opens at `/orders/[id]/print`.
4. Page renders: ARM Optics header, order number and date, customer details, pricing summary, full Rx table, frame details, lens details, services and accessories table, notes, lab info, signature line.
5. Below a dashed cut line: the customer receipt slip with condensed summary.
6. Staff clicks **Print / Save PDF** to invoke `window.print()`.

### 6.6 Portal Access Provisioning

1. Admin or authorised staff opens a customer record.
2. Clicks **Create Portal Access**.
3. System invites the customer's email via Supabase Auth invite flow.
4. Customer receives email with link to set password at `/portal-login`.
5. On first login, `portal_user_id` on the customer record is confirmed.
6. Staff can revoke portal access by clearing `portal_user_id` and disabling the auth user.

### 6.7 Scheduling a Reminder

1. Staff opens the **Reminders** module or does so from an order or customer record.
2. Selects customer (pre-filled if navigating from a record).
3. Selects type: Glasses Ready, Exam Due, or Custom.
4. Sets scheduled date/time.
5. Enters recipient email (pre-filled from customer).
6. Optionally customises subject and message body.
7. Saves. Record created with status `scheduled`.
8. Edge function `send-email-reminder` runs every 15 minutes, picks up any `scheduled` reminders where `scheduled_at <= NOW()`, sends via Resend, updates status to `sent` or records `failed` with error message.

### 6.8 GenSoft Product Lookup During Order Entry

1. Staff clicks the product search icon next to a frame or lens SKU field.
2. A search modal opens querying `gensoft_products` with full-text search.
3. Results show SKU, name, supplier, sell price, stock level.
4. Selecting a product populates the relevant SKU field and optionally the brand/supplier text fields.
5. Search operates against the locally cached `gensoft_products` table — no live call to GenSoft at order time.

---

## 7. Digital Order Form Structure

This section documents the exact field mapping from the ARM Optics paper order form to the digital system. All fields on the physical form have direct database equivalents.

### 7.1 Order Header

| Paper Field | Database Column | Type | Notes |
|---|---|---|---|
| Order Number | `orders.order_number` | TEXT | Auto-generated `ARM-YYYY-NNNNN` |
| Date | `orders.order_date` | DATE | Defaults to today |
| Status | `orders.status` | ENUM | `order_status` type |
| Est. Collection Date | `orders.collection_date` | DATE | Optional |

### 7.2 Customer Information

| Paper Field | Database Column | Type |
|---|---|---|
| Title / Name | `customers.first_name`, `customers.last_name` | TEXT |
| Date of Birth | `customers.date_of_birth` | DATE |
| Phone | `customers.phone` | TEXT |
| Mobile | `customers.mobile` | TEXT |
| Email | `customers.email` | TEXT |
| Address | `customers.address_line1`, `address_line2` | TEXT |
| Suburb / State / Postcode | `customers.suburb`, `state`, `postcode` | TEXT |
| Medicare Number | `customers.medicare_number` | TEXT |
| DVA Number | `customers.dva_number` | TEXT |
| Health Fund | `customers.health_fund_name`, `health_fund_number`, `health_fund_ref` | TEXT |

### 7.3 Spectacle Prescription (Rx Snapshot on Order)

| Paper Field | Database Column | Type | Constraint |
|---|---|---|---|
| OD SPH | `orders.lens_od_sph` | NUMERIC(5,2) | — |
| OD CYL | `orders.lens_od_cyl` | NUMERIC(5,2) | — |
| OD AXIS | `orders.lens_od_axis` | SMALLINT | 0–180 |
| OD ADD | `orders.lens_od_add` | NUMERIC(4,2) | — |
| OS SPH | `orders.lens_os_sph` | NUMERIC(5,2) | — |
| OS CYL | `orders.lens_os_cyl` | NUMERIC(5,2) | — |
| OS AXIS | `orders.lens_os_axis` | SMALLINT | 0–180 |
| OS ADD | `orders.lens_os_add` | NUMERIC(4,2) | — |
| PD Distance R | `orders.pd_distance_right` | NUMERIC(4,1) | — |
| PD Distance L | `orders.pd_distance_left` | NUMERIC(4,1) | — |
| PD Near R | `orders.pd_near_right` | NUMERIC(4,1) | — |
| PD Near L | `orders.pd_near_left` | NUMERIC(4,1) | — |
| Single PD | `orders.pd_single` | NUMERIC(4,1) | — |

> **Implementation note:** All Rx input fields are treated as `string` in the React form layer (`OrderFormValues`) to allow partial entry and prevent premature validation errors. The `orderFormToDbValues()` helper converts them to `number | null` before the Supabase insert.

### 7.4 Frame Details

| Paper Field | Database Column |
|---|---|
| Supplier | `orders.frame_supplier` |
| Brand | `orders.frame_brand` |
| Model | `orders.frame_model` |
| Colour | `orders.frame_colour` |
| Size | `orders.frame_size` |
| GenSoft SKU | `orders.frame_gensoft_sku` |

### 7.5 Lens Details

| Paper Field | Database Column |
|---|---|
| Lens Type | `orders.lens_type` |
| Material | `orders.lens_material` |
| Coating | `orders.lens_coating` |
| Supplier | `orders.lens_supplier` |
| GenSoft SKU | `orders.lens_gensoft_sku` |

### 7.6 Services and Accessories

Stored as JSONB arrays on the order:

```jsonc
// orders.services
[{ "name": "Frame Repair", "price": 25.00 }]

// orders.accessories
[{ "name": "Case", "sku": "CASE-001", "qty": 1, "price": 15.00 }]
```

### 7.7 Pricing

| Paper Field | Database Column | Derivation |
|---|---|---|
| Total Price | `orders.total_price` | Staff-entered |
| Deposit Paid | `orders.deposit_paid` | Staff-entered |
| Balance Due | computed | `total_price - deposit_paid` (DB function `order_balance_due`) |

### 7.8 Lab Information

| Field | Database Column |
|---|---|
| Lab Name | `orders.lab_name` |
| Lab Reference | `orders.lab_order_ref` |
| Date Sent to Lab | `orders.lab_sent_date` |

### 7.9 Notes

| Field | Database Column | Visibility |
|---|---|---|
| Customer Notes | `orders.notes` | Staff + Portal customer |
| Internal Notes | `orders.internal_notes` | Staff only — never exposed to portal |

### 7.10 Customer Acknowledgement

| Field | Database Column |
|---|---|
| Acknowledged | `orders.customer_acknowledged` (BOOLEAN) |
| Acknowledged At | `orders.acknowledged_at` (TIMESTAMPTZ) |

---

## 8. Printable Document Requirements

### 8.1 Full Order Document

Rendered at `/orders/[id]/print`. Optimised for A4 paper at 15mm margins.

**Document sections (top to bottom):**

1. **Header row** — ARM OPTICS wordmark (left), order number + date + status (right)
2. **Two-column section** — Customer details (left), pricing summary table (right)
3. **Spectacle Prescription table** — Rows: OD / OS. Columns: SPH, CYL, AXIS, ADD, PD (dist), PD (near). Single PD shown below if populated.
4. **Frame & Lenses side-by-side** — Each in a bordered box: brand, model, colour, size, supplier, SKU.
5. **Services & Accessories table** — Item, qty, price columns. Only rendered if data exists.
6. **Notes** — Customer-visible notes only.
7. **Lab section** — Lab name, reference, sent date. Only rendered if data exists.
8. **Signature row** — Customer signature line (left), staff authorisation line (right).

### 8.2 Customer Receipt Slip

Rendered immediately below the full order document, separated by a dashed `✂ CUSTOMER RECEIPT` cut line.

**Receipt contents:**
- ARM OPTICS header + order number + order date
- Customer name and phone
- Total price, deposit paid, balance due
- Frame summary (brand, model, colour)
- Lens summary (type, material)
- Estimated collection date
- Footer: "Please retain this receipt. Bring it when collecting your order."

### 8.3 Print Implementation

- `@media print` CSS: hides the Print/Close buttons, sets white background, `@page` margin 15mm.
- No server-side PDF generation. Browser print-to-PDF is the supported workflow.
- Print page is a standalone route accessible only to authenticated staff.
- Page layout uses `max-w-[210mm]` in browser view, `max-w-none` when printing.

---

## 9. Customer Portal Requirements

### 9.1 Access

- Portal login at `/portal-login` — separate from staff login at `/login`.
- Authentication uses the same Supabase Auth project. Portal users are distinguished by the presence of `customers.portal_user_id = auth.uid()`.
- Customers receive email invitations from staff. They set their own password.
- Portal session is isolated from staff session — staff accounts cannot access portal routes.

### 9.2 Portal Dashboard (`/portal`)

- Greeting with customer's name.
- Card showing the most recent prescription (type, exam date, key Rx values).
- Card showing the most recent order (order number, status badge, collection date).
- Links to full prescription and order lists.

### 9.3 Prescription List (`/portal/prescriptions`)

- All prescriptions in reverse exam-date order.
- Each entry shows: prescription type, exam date, prescribing optometrist, OD/OS Rx summary, PD values.
- Contact lens prescriptions show CL-specific fields.

### 9.4 Order List (`/portal/orders`)

- All orders in reverse order date.
- Each entry shows: order number, order date, status badge, frame (brand/model), lens type, total price, balance due, estimated collection date.
- Internal notes are **not** displayed.

### 9.5 Portal Constraints

- No create, edit, or delete actions for any portal user.
- Portal users cannot see other customers' data (enforced by RLS).
- Portal users cannot access any staff routes or admin functions.

---

## 10. Notification and Reminder Requirements

### 10.1 Reminder Types

| Type | Trigger | Default Timing |
|---|---|---|
| `glasses_ready` | Order status transitions to `ready` | Immediately (or configurable delay) |
| `exam_due` | `prescriptions.next_exam_date` is approaching | 30 days before (configurable) |
| `custom` | Manual staff creation | Staff-defined date and time |

### 10.2 Delivery Mechanism

- All reminders delivered via **email** using the Resend API.
- Supabase Edge Function `send-email-reminder` handles dispatch.
- Function is scheduled by a Supabase cron job running every 15 minutes:
  `*/15 * * * *`
- Function queries `reminders` WHERE `status = 'scheduled'` AND `scheduled_at <= NOW()`.
- On success: updates `status = 'sent'`, sets `sent_at`.
- On failure: updates `status = 'failed'`, records `error_message`.

### 10.3 Reminder Record Fields

```
customer_id       — who the reminder is for
order_id          — optional link to an order (e.g., glasses_ready)
reminder_type     — glasses_ready | exam_due | custom
status            — scheduled | sent | failed | cancelled
scheduled_at      — when to send
sent_at           — when actually sent
recipient_email   — defaults to customer.email, overridable
recipient_phone   — stored for future SMS support
subject           — email subject line
body              — email body text
error_message     — populated on failure
created_by        — staff member who scheduled it
```

### 10.4 Reminder Management UI

- **Reminders page** (`/reminders`): table of all reminders with filters by status and type.
- Staff can cancel a scheduled reminder (sets `status = 'cancelled'`).
- Staff can create a manual custom reminder from this page or from a customer/order record.
- Overdue failed reminders are visually highlighted for staff attention.

### 10.5 Future SMS Support

The `recipient_phone` field is reserved for future SMS delivery. The edge function architecture supports adding an SMS provider (e.g., Twilio, MessageBird) as a parallel delivery path without schema changes.

---

## 11. GenSoft MoneyWorks Integration Scope

### 11.1 Purpose and Boundaries

The GenSoft MoneyWorks integration is strictly a **product reference lookup** tool. It does not:

- Replace or duplicate MoneyWorks accounting functions.
- Sync sales, payments, or invoices.
- Write any data back to MoneyWorks.
- Manage inventory levels from within the CRM.

Its sole purpose is to allow staff to search and reference products (frames, lenses, accessories) by SKU during order entry.

### 11.2 Sync Mechanism

- Supabase Edge Function `gensoft-sync` pulls the product catalogue from MoneyWorks via its REST/XML API.
- Runs on a 4-hour cron schedule: `0 */4 * * *`
- Products are upserted into the local `gensoft_products` cache table using SKU as the unique key.
- The `synced_at` timestamp is updated on each sync.
- A full-text search vector (`search_vector`) is maintained via database trigger for fast product search.

### 11.3 Data Captured per Product

| Field | Source | Usage |
|---|---|---|
| `sku` | MoneyWorks item code | Unique key; linked to `frame_gensoft_sku` / `lens_gensoft_sku` on orders |
| `name` | MoneyWorks item name | Display name in search results |
| `category` | MoneyWorks category | Filtering in inventory view |
| `supplier` | MoneyWorks supplier | Shown in search results; optionally auto-filled in order form |
| `cost_price` | MoneyWorks cost | For internal reference only (visible to admin/dispenser, not portal) |
| `sell_price` | MoneyWorks sell price | Suggested price during order entry |
| `stock_qty` | MoneyWorks stock on hand | Indicative availability; not real-time |
| `is_active` | Derived from MoneyWorks status | Inactive products hidden from search |
| `raw_data` | Full raw JSON from MoneyWorks | Stored for debugging and future field mapping |

### 11.4 UI Integration Points

- **Order form frame section:** Lens icon opens a product search modal scoped to frame-category products.
- **Order form lens section:** Lens icon opens a product search modal scoped to lens-category products.
- **Inventory page** (`/inventory`): Full searchable list of all active GenSoft products for staff reference.

### 11.5 Configuration

GenSoft API credentials are stored as Supabase Edge Function secrets (never in version control):

```
GENSOFT_API_URL
GENSOFT_API_KEY     (or username/password pair as required by MoneyWorks)
```

---

## 12. Supabase Architecture Approach

### 12.1 Auth

- **Staff auth:** Standard email/password. Staff must be pre-created by an admin. Self-signup is disabled for staff accounts (configurable in `supabase/config.toml`).
- **Portal auth:** Customer invited via Supabase `inviteUserByEmail`. They follow the invite link to set a password. `enable_signup = true` in config to support invite confirmations.
- **JWT expiry:** 3600 seconds (1 hour). Refresh token rotation enabled with 10-second reuse interval.
- **Double confirm changes:** Enabled for email changes.

### 12.2 Database

- PostgreSQL 17.
- Extensions: `pg_trgm` (trigram search for partial name matching).
- All tables have `created_at` / `updated_at` timestamps; `updated_at` maintained by `set_updated_at()` trigger.
- Soft delete is **not** used — records are hard-deleted or status-transitioned to `cancelled`.
- UUID primary keys throughout (`gen_random_uuid()`).
- Order numbers are human-readable: `ARM-YYYY-NNNNN` (generated by trigger on insert).

### 12.3 Migrations

All schema changes are managed via Supabase CLI migrations in `supabase/migrations/`:

| File | Contents |
|---|---|
| `00001_initial_schema.sql` | All table definitions, enum types |
| `00002_functions_triggers.sql` | Triggers, helper functions, order number generation |
| `00003_indexes.sql` | Performance indexes for FK columns and search vectors |
| `00004_rls_policies.sql` | All RLS enablement and policies |

New features must add a new numbered migration file. Migrations are idempotent where possible.

### 12.4 Storage

Supabase Storage is provisioned for:

- `order-attachments` bucket — future support for attaching scanned prescriptions, lab delivery notes, or signed order forms as PDFs/images.
- `customer-documents` bucket — future support for storing Medicare card scans or health fund documents.

File size limit: 50MiB per file (configured in `config.toml`).

### 12.5 Edge Functions

| Function | Trigger | Purpose |
|---|---|---|
| `send-email-reminder` | Cron `*/15 * * * *` | Query due reminders, dispatch via Resend, update status |
| `gensoft-sync` | Cron `0 */4 * * *` | Pull MoneyWorks catalogue, upsert into `gensoft_products` |

Both functions have `verify_jwt = false` in config as they are invoked by the Supabase scheduler, not by user requests.

### 12.6 Cron Jobs

Defined in `config.toml` under the `[cron]` section (uncommented after initial `db push`):

```toml
[cron]
send_reminders = { schedule = "*/15 * * * *", function = "send-email-reminder" }
gensoft_sync   = { schedule = "0 */4 * * *",  function = "gensoft-sync" }
```

### 12.7 Environment Variables

Required in `.env.local` (never committed):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # Server-side only
```

Edge function secrets (set via `supabase secrets set`):

```
RESEND_API_KEY
GENSOFT_API_URL
GENSOFT_API_KEY
```

---

## 13. Suggested Database Schema

The schema below reflects the current implemented state plus fields recommended for immediate inclusion.

### 13.1 Enums

```sql
CREATE TYPE order_status AS ENUM (
  'pending', 'in_progress', 'lab_sent', 'ready', 'collected', 'cancelled'
);

CREATE TYPE prescription_type AS ENUM (
  'distance', 'near', 'bifocal', 'progressive', 'contact_lens'
);

CREATE TYPE reminder_type AS ENUM (
  'glasses_ready', 'exam_due', 'custom'
);

CREATE TYPE reminder_status AS ENUM (
  'scheduled', 'sent', 'failed', 'cancelled'
);

CREATE TYPE staff_role AS ENUM (
  'admin', 'optometrist', 'dispenser', 'receptionist'
);
```

### 13.2 `staff_profiles`

```sql
CREATE TABLE staff_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        staff_role NOT NULL DEFAULT 'receptionist',
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 13.3 `customers`

```sql
CREATE TABLE customers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  date_of_birth       DATE,
  email               TEXT,
  phone               TEXT,
  mobile              TEXT,
  address_line1       TEXT,
  address_line2       TEXT,
  suburb              TEXT,
  state               TEXT,
  postcode            TEXT,
  country             TEXT DEFAULT 'Australia',
  portal_user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gensoft_customer_id TEXT,        -- future link to MoneyWorks customer
  medicare_number     TEXT,
  dva_number          TEXT,
  health_fund_name    TEXT,
  health_fund_number  TEXT,
  health_fund_ref     TEXT,
  notes               TEXT,
  search_vector       TSVECTOR,    -- maintained by trigger
  created_by          UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 13.4 `prescriptions`

```sql
CREATE TABLE prescriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  prescription_type prescription_type NOT NULL DEFAULT 'distance',
  exam_date         DATE NOT NULL,
  next_exam_date    DATE,
  prescribing_optom TEXT,
  -- Spectacle Rx
  od_sph    NUMERIC(5,2),   od_cyl  NUMERIC(5,2),
  od_axis   SMALLINT CHECK (od_axis BETWEEN 0 AND 180),
  od_add    NUMERIC(4,2),   od_va   TEXT,
  os_sph    NUMERIC(5,2),   os_cyl  NUMERIC(5,2),
  os_axis   SMALLINT CHECK (os_axis BETWEEN 0 AND 180),
  os_add    NUMERIC(4,2),   os_va   TEXT,
  -- PD
  pd_distance_right NUMERIC(4,1),  pd_distance_left NUMERIC(4,1),
  pd_near_right     NUMERIC(4,1),  pd_near_left     NUMERIC(4,1),
  pd_single         NUMERIC(4,1),
  -- Contact lens
  cl_od_brand TEXT,  cl_od_base_curve NUMERIC(4,2),
  cl_od_diameter NUMERIC(4,1),  cl_od_power NUMERIC(5,2),
  cl_od_cylinder NUMERIC(4,2),  cl_od_axis SMALLINT,
  cl_os_brand TEXT,  cl_os_base_curve NUMERIC(4,2),
  cl_os_diameter NUMERIC(4,1),  cl_os_power NUMERIC(5,2),
  cl_os_cylinder NUMERIC(4,2),  cl_os_axis SMALLINT,
  notes         TEXT,
  recorded_by   UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 13.5 `orders`

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT NOT NULL UNIQUE DEFAULT '',
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  status          order_status NOT NULL DEFAULT 'pending',
  order_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  collection_date DATE,
  -- Rx snapshot (copied from prescription at order creation time)
  lens_od_sph NUMERIC(5,2),  lens_od_cyl NUMERIC(5,2),
  lens_od_axis SMALLINT,     lens_od_add NUMERIC(4,2),
  lens_os_sph NUMERIC(5,2),  lens_os_cyl NUMERIC(5,2),
  lens_os_axis SMALLINT,     lens_os_add NUMERIC(4,2),
  pd_distance_right NUMERIC(4,1),  pd_distance_left NUMERIC(4,1),
  pd_near_right     NUMERIC(4,1),  pd_near_left     NUMERIC(4,1),
  pd_single         NUMERIC(4,1),
  -- Frame
  frame_supplier TEXT,  frame_brand TEXT,  frame_model TEXT,
  frame_colour TEXT,    frame_size TEXT,   frame_gensoft_sku TEXT,
  -- Lens product
  lens_type TEXT,       lens_material TEXT,  lens_coating TEXT,
  lens_supplier TEXT,   lens_gensoft_sku TEXT,
  -- Line items (JSONB)
  services    JSONB NOT NULL DEFAULT '[]',
  accessories JSONB NOT NULL DEFAULT '[]',
  -- Pricing
  total_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Lab
  lab_name TEXT,  lab_order_ref TEXT,  lab_sent_date DATE,
  -- Acknowledgement
  customer_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at       TIMESTAMPTZ,
  -- Notes
  notes          TEXT,    -- visible to portal customer
  internal_notes TEXT,    -- staff-only
  created_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 13.6 `order_status_history`

```sql
CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  changed_by  UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 13.7 `reminders`

```sql
CREATE TABLE reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  reminder_type   reminder_type NOT NULL,
  status          reminder_status NOT NULL DEFAULT 'scheduled',
  scheduled_at    TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  recipient_email TEXT,
  recipient_phone TEXT,
  subject         TEXT,
  body            TEXT,
  error_message   TEXT,
  created_by      UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 13.8 `gensoft_products`

```sql
CREATE TABLE gensoft_products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku          TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  category     TEXT,
  supplier     TEXT,
  cost_price   NUMERIC(10,2),
  sell_price   NUMERIC(10,2),
  stock_qty    INTEGER,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  raw_data     JSONB,
  synced_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_vector TSVECTOR
);
```

### 13.9 Key Indexes

```sql
-- Customer search
CREATE INDEX idx_customers_search_vector ON customers USING GIN(search_vector);
CREATE INDEX idx_customers_portal_user   ON customers(portal_user_id);
CREATE INDEX idx_customers_last_name     ON customers(last_name);

-- Orders
CREATE INDEX idx_orders_customer_id  ON orders(customer_id);
CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_order_date   ON orders(order_date DESC);

-- Prescriptions
CREATE INDEX idx_prescriptions_customer_id ON prescriptions(customer_id);

-- Order status history
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Reminders
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX idx_reminders_customer  ON reminders(customer_id);

-- GenSoft
CREATE INDEX idx_gensoft_search_vector ON gensoft_products USING GIN(search_vector);
CREATE INDEX idx_gensoft_sku           ON gensoft_products(sku);
```

---

## 14. Recommended RLS Strategy

### 14.1 Design Principles

1. **All tables have RLS enabled.** No table is left unprotected.
2. **`SECURITY DEFINER` helper functions** (`is_staff()`, `is_admin()`, `get_customer_id_for_portal_user()`) centralise identity checks, preventing policy duplication and reducing the attack surface.
3. **Policies are additive.** A user needs at least one policy to grant access. No implicit permissive defaults.
4. **Service role bypasses RLS** for edge functions that insert/update on behalf of no user session (GenSoft sync, reminder dispatch).
5. **Portal users never see `internal_notes`** — enforced by query-level column exclusion in server actions, with the field never referenced in portal API calls.

### 14.2 Policy Summary

```sql
-- staff_profiles
-- SELECT: any active staff can read all profiles
-- ALL: only admin can insert/update/delete
-- SELECT own: any auth user can read their own row
-- UPDATE own: any auth user can update their own row

-- customers
-- ALL: any active staff member
-- SELECT: portal user can read their own customer row

-- prescriptions
-- ALL: any active staff member
-- SELECT: portal user can read prescriptions belonging to their customer

-- orders
-- ALL: any active staff member
-- SELECT: portal user can read orders belonging to their customer

-- order_status_history
-- SELECT: any active staff member
-- INSERT: any active staff member

-- reminders
-- ALL: any active staff member

-- gensoft_products
-- SELECT: any authenticated user (staff or portal)
-- ALL: service_role only (for edge function syncs)
```

### 14.3 Future Role-Level Policies

When role-differentiated permissions are required (e.g., preventing receptionists from editing prescriptions), replace the catch-all `is_staff()` checks with role-aware variants:

```sql
-- Example: prescriptions write restricted to optometrist/admin/dispenser
CREATE POLICY "prescriptions_write_clinical"
  ON prescriptions FOR INSERT UPDATE DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'optometrist', 'dispenser')
        AND is_active = TRUE
    )
  );
```

---

## 15. MVP Scope

The following features constitute the minimum viable product and are considered the baseline for the first production deployment.

### In MVP

| Feature | Status |
|---|---|
| Staff authentication (email/password) | ✅ Implemented |
| Staff roles: admin, optometrist, dispenser, receptionist | ✅ Implemented |
| Customer create / search / view / edit | ✅ Implemented |
| Prescription create / view (all types inc. contact lens) | ✅ Implemented |
| Order create with full Rx snapshot | ✅ Implemented |
| Order status pipeline with history | ✅ Implemented |
| Printable full order document + receipt slip | ✅ Implemented |
| Email reminders (glasses ready, exam due, custom) via Resend | ✅ Implemented |
| GenSoft MoneyWorks product sync and search | ✅ Implemented |
| Customer portal (login, view prescriptions, view orders) | ✅ Implemented |
| Staff dashboard with key stats and recent orders | ✅ Implemented |
| RLS enforcement across all tables | ✅ Implemented |
| Auto-generated human-readable order numbers | ✅ Implemented |
| Internal vs customer-visible notes segregation | ✅ Implemented |
| Admin settings page for staff management | ✅ Implemented |

### Not in MVP (Deferred to Future Phases)

- SMS reminder delivery
- Medicare / DVA claiming workflow
- Payment recording with receipt generation
- File attachment upload to orders (scanned documents)
- Multi-location / multi-practice support
- Reporting and analytics dashboard
- Automated exam-due reminder scheduling from prescription entry
- Customer portal write actions (e.g., appointment requests)
- Bulk data import from existing paper records

---

## 16. Future Phases

### Phase 2 — Enhanced Operations

- **Automated exam-due reminders:** When a prescription is saved with `next_exam_date`, automatically create a `exam_due` reminder record scheduled 30 days prior. Configurable lead time per practice preference.
- **Glasses-ready auto-reminder:** When order status transitions to `ready`, automatically create a `glasses_ready` reminder for immediate dispatch without requiring manual creation.
- **Order edit history:** Extend `order_status_history` pattern to log field-level changes on order updates (using a JSONB diff approach or a separate `order_audit_log` table).
- **Storage attachments:** Allow staff to upload PDFs or images (signed prescriptions, lab delivery notes) against an order or customer record using Supabase Storage.

### Phase 3 — Financial and Reporting

- **Revenue reporting:** Monthly/weekly revenue totals, outstanding balances, order counts by staff member.
- **Reminder delivery analytics:** Sent vs failed ratios, delivery trends.
- **Lab turnaround tracking:** Average time between `lab_sent` and `ready` by lab name.
- **Overdue balance report:** List of orders where balance > 0 and status is `collected`.
- **Customer retention:** Customers not seen in 12+ months (last exam date).

### Phase 4 — Patient Engagement

- **SMS reminders:** Add Twilio or MessageBird as an alternate delivery path in `send-email-reminder`. Schema already supports `recipient_phone` and the structure supports multi-channel dispatch.
- **Portal appointment requests:** Allow customers to submit a contact/callback request through the portal (stored as a new `portal_requests` table, triaged by reception).
- **Portal prescription download:** Allow customers to download a formatted PDF of their most recent prescription.

### Phase 5 — Medicare and Health Fund Integration

- **Medicare claiming workflow:** Capture bulk-billing or patient-claim details on prescriptions, generate Medicare claim references.
- **DVA order support:** Tag orders as DVA-funded with required DVA claim fields.
- **Health fund rebate tracking:** Record rebate amounts received per order.

### Phase 6 — Multi-Location

- **Practice/location model:** Introduce a `locations` table. Associate staff, customers, and orders to a location. RLS extended with location-scoping.
- **Cross-location customer lookup:** Search customers across all locations with visibility controls.

---

## 17. Admin and Reporting Needs

### 17.1 Admin Functions (Available Now)

- **Staff management:** View all staff profiles, toggle active status, update roles. Available at `/settings` for admin users only.
- **System health:** View reminder queue status (scheduled, sent, failed counts) on the reminders page.
- **GenSoft sync status:** View last sync time from `gensoft_products.synced_at`. Trigger manual sync via edge function invoke (future UI button).

### 17.2 Reporting Requirements (Phase 3)

All reports should be available on a dedicated `/reports` route, visible to admin only.

| Report | Description | Key Metrics |
|---|---|---|
| Revenue Summary | Orders by period, total revenue, deposits collected | Total, by month, by staff member |
| Outstanding Balances | Orders collected with balance remaining | Order #, customer, balance, collected date |
| Order Pipeline | Current distribution of orders across all statuses | Count per status, average age |
| Lab Turnaround | Time from `lab_sent_date` to status `ready` by lab | Average days, by lab name |
| Customer Activity | Customers by last visit date | Last exam, last order, contact details |
| Reminder Delivery | Reminder send success/failure rate | By type, by period |

### 17.3 Data Export

- All report tables should support CSV export via a client-side `export to CSV` button.
- No server-side PDF generation required for reports.

---

## 18. UX/UI Requirements Aligned to ARM Optics Branding

### 18.1 Brand Palette

The staff interface uses a dark, high-contrast palette that reflects ARM Optics' premium optical brand.

| Token | Hex | Usage |
|---|---|---|
| `dark-950` | `#0d0d0d` | Page/sidebar background |
| `dark-900` | `#1a1a1a` | Secondary background, card backgrounds |
| `dark-800` | `#262626` | Input backgrounds, hover states |
| `dark-700` | `#333333` | Borders, dividers |
| `dark-400` | `#888888` | Secondary labels, placeholder text |
| `dark-200` | `#cccccc` | Body text |
| `dark-100` | `#f0f0f0` | Headings, primary text |
| `gold` | `#c9a84c` | Primary accent: buttons, links, highlights |
| `gold-light` | `#e2c97e` | Hover state for gold elements |
| `gold-dark` | `#a0812e` | Active / pressed states |

The print layout (`/orders/[id]/print`) uses white background with black text to ensure clean printing — brand colours do not appear in the printed output.

### 18.2 Typography

- System font stack for UI: `font-sans` (Inter or system-ui).
- Display headings: `font-display` class.
- Numeric data (Rx values, prices, order numbers): `tabular-nums` to prevent layout shifts.
- All Rx field values rendered with `+/-` sign where appropriate using `formatRxValue()` utility.

### 18.3 Component Patterns

| Pattern | Implementation |
|---|---|
| Cards | `bg-dark-800/60 border border-white/[0.06] rounded-xl` |
| Input fields | `input-base` CSS class — dark background, subtle border, gold focus ring |
| Rx table cells | `rx-cell` CSS class — fixed-width, tabular numerics, tight padding |
| Status badges | `status-badge` CSS class + status-specific colour: pending=yellow, ready=green, collected=muted, cancelled=red |
| Buttons | Primary: gold background. Secondary: outline with dark border. Destructive: red. |
| Sidebar | Fixed left panel, dark-950 background, gold accent on active item |

### 18.4 Layout Principles

- **Sidebar navigation** fixed on desktop; collapsible or bottom-nav on mobile.
- **Page headers** (`PageHeader` component): title left, action buttons right.
- **Tables** on order/customer lists: hover highlight, clickable rows navigate to detail.
- **Form layout:** Tabbed sections for complex forms (order form uses Prescription & Lenses / Frame & Accessories / Pricing & Lab / Notes tabs).
- **Responsive:** All views usable on tablet. Order entry form is the most complex; tabs prevent horizontal overflow.
- **Empty states:** Descriptive empty state with a call-to-action link when no records exist (e.g., "No orders yet. Create the first one.").

### 18.5 Portal Branding

The customer portal uses the same brand palette with a slightly simpler layout — no sidebar, top navigation only. It should feel like a natural extension of the ARM Optics website, not a generic SaaS dashboard.

- Portal header: ARM Optics logo/wordmark + "My Account" label.
- Minimal, clean prescription display — approachable for non-clinical patients.
- Order status communicated in plain language ("Your glasses are ready for collection.") alongside the technical status badge.

### 18.6 Accessibility

- All interactive elements must have visible focus rings (`gold` coloured).
- Form labels must be explicitly associated with inputs (`<Label htmlFor>` / Radix patterns).
- Status badges must not rely on colour alone — text labels always present.
- Print layout must be legible at 100% zoom without colour (greyscale-safe).

### 18.7 Feedback Patterns

- **Toasts (Sonner):** Used for success/error feedback on form submissions and status changes. Success: green. Error: red. Non-dismissable only for critical errors.
- **Loading states:** Buttons show spinner + "Saving..." text while async operations are in flight using `isSubmitting` from React Hook Form.
- **Optimistic updates:** Not used. All state changes wait for server confirmation before updating the UI.

---

*This PRD reflects the ARM Optics CRM as designed and partially implemented as of March 2026. All schema, policy, and component patterns described here are grounded in the current codebase. New features should follow the conventions established in this document.*
