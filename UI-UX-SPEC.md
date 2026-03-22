# ARM Optics CRM — UI/UX Design Specification
**Version 1.0 · March 2026**

---

## 1. Brand & Design System

### Identity

ARM Optics is a professional optical shop serving Australian customers. The digital platform must feel like a premium optical brand — refined, precise, trustworthy — not generic SaaS. The dark gold palette signals craftsmanship and expertise.

### Colour Tokens

| Token | Hex | Usage |
|---|---|---|
| `dark-950` | `#0d0d0d` | Page background, sidebar |
| `dark-900` | `#1a1a1a` | Input backgrounds, section fills |
| `dark-800/60` | `#454545 60%` | Card surfaces (glassmorphism) |
| `dark-400` | `#888888` | Secondary text, labels |
| `dark-100` | `#e7e7e7` | Primary text |
| `gold` | `#c9a84c` | Accent: active states, CTAs, icons |
| `gold-light` | `#e2c97e` | Hover gold |
| `gold-dark` | `#a0812e` | Pressed/dark gold |

### Typography

- **Headings:** Playfair Display — `font-display`. Used for page titles, order numbers, logo.
- **Body/UI:** Inter — `font-sans`. Used everywhere else.
- **Tabular data (Rx, prices):** Always `tabular-nums` class. Never proportional-width numerals in data cells.
- **Labels:** `section-label` class: `text-xs font-semibold uppercase tracking-widest text-dark-400`

### Spacing Scale

- Section gap: `gap-6` (24px)
- Card inner padding: `p-5` (20px)
- List row padding: `px-5 py-3.5`
- Tight rows (compact tables): `px-4 py-2.5`

### Card Component

```
.card = bg-dark-800/60 border border-white/[0.06] rounded-xl backdrop-blur-sm
```

Cards are the primary container surface. Never put a card inside a card. Separate related sections with `space-y-6` not nested cards.

### Input Component

```
.input-base = bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm
             focus:ring-2 focus:ring-gold/40 focus:border-gold/50
```

Prescription grid cells use `.rx-cell` — smaller, centre-aligned, tabular.

### Status Badges

Five order states:
| Status | Colour classes |
|---|---|
| `pending` | `text-yellow-300 bg-yellow-500/10 border-yellow-500/20` |
| `ordered` | `text-blue-300 bg-blue-500/10 border-blue-500/20` |
| `in_lab` | `text-purple-300 bg-purple-500/10 border-purple-500/20` |
| `ready` | `text-green-300 bg-green-500/10 border-green-500/20` |
| `collected` | `text-dark-300 bg-white/5 border-white/10` |

### Buttons

- **Primary (gold):** `bg-gold text-dark-950 hover:bg-gold-light font-semibold`
- **Outline:** `border border-white/10 text-dark-200 hover:bg-white/5`
- **Destructive:** `border border-red-500/30 text-red-400 hover:bg-red-500/10`
- **Icon-only:** `p-2 rounded-lg hover:bg-white/5`

---

## 2. Layout Architecture

### Staff App (Desktop-First)

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (w-60, fixed)  │  Main content (ml-60, flex-1) │
│  ─────────────────────  │  ─────────────────────────────│
│  [Logo]                 │  [PageHeader]                  │
│  [Nav Items]            │    title + description + CTA   │
│  ...                    │  [Page content]                │
│  [Sign Out]             │                                │
└──────────────────────────────────────────────────────────┘
```

Main content area: `ml-60 min-h-screen p-8 max-w-[1400px]`

### Portal App (Mobile-First)

```
┌───────────────────────────────────┐
│  Top nav bar (logo + name + menu) │
│  ─────────────────────────────────│
│  Page content (px-4 py-6)         │
│                                   │
│  Bottom tab bar (mobile nav)      │
└───────────────────────────────────┘
```

Portal uses a simple top bar + bottom tab bar pattern. Max width `max-w-lg mx-auto` for single-column layouts.

### PageHeader Component

Every staff page uses `<PageHeader>`:
```
title: string            → h1, font-display text-2xl
description?: string     → text-sm text-dark-400
actions?: ReactNode      → right-aligned button group
```

---

## 3. Screen Specifications

---

### 3.1 Login (`/login`)

**Purpose:** Staff authentication entry point.

**Layout:**
- Full dark-950 background with subtle `bg-grid-dark` grid texture
- Soft gold radial blur orb centred behind the card (decorative)
- Single centred card, max-w-sm

**Components:**
```
[Eye icon in gold rounded-2xl]
[ARM Optics — Playfair Display h1]
[Staff Portal — text-dark-400 caption]

Card:
  Sign in (h2)
  Credentials for CRM access (subtitle)

  Email address field
  Password field (with show/hide toggle)
  [Sign in] — full width primary button

  Forgot password? — link below button

Footer:
  Customer portal? Sign in here → /portal-login
```

**Improvements needed:**
- Add keyboard shortcut hint: "Press Enter to sign in"
- Auto-focus email field on mount
- Show Supabase connection error state (not just `toast.error`)

---

### 3.2 Reset Password (`/reset-password`) & Update Password (`/update-password`)

Same card layout as Login. Single field, descriptive body copy explaining what to do.

---

### 3.3 Dashboard (`/dashboard`)

**Purpose:** At-a-glance operational overview. First screen staff sees each morning.

**Layout:**
```
[PageHeader]
  "Good morning, [name]"
  "Today is Monday 22 March 2026"
  Actions: [New Customer] [New Order]

[Stats row — 4 columns]
  Total Customers  (blue)
  Pending Orders   (yellow)
  Ready to Collect (green)
  Orders Today     (gold)

[Recent Orders — full-width card]
  Header: "Recent Orders" + "View all →"
  Rows: order number · customer name · date · amount · status badge
```

**Improvements needed:**
- Add a **5th stat card**: "Overdue Reminders" (reminders.status = scheduled, scheduled_at < now) in red
- Add a **"Quick Actions" row** below stats (before orders table):
  ```
  [🔍 Search Customers]  [+ New Order]  [+ New Customer]  [📋 View Ready Orders]
  ```
  These are icon + text action pills using outline button style. Saves navigating to other pages for common actions.
- Add a **"Ready for Collection" mini-list** as second card alongside Recent Orders (2-column grid on desktop). Shows customers with `status = ready` and their collection date.
- Make the stats cards clickable: "Pending Orders" → `/orders?status=pending`, etc.

---

### 3.4 Customers List (`/customers`)

**Purpose:** Find any customer fast during a live store interaction.

**Layout:**
```
[PageHeader]
  "Customers"
  Actions: [+ New Customer]

[Search bar — full width, prominent]
  Placeholder: "Search by name, phone, email, or Medicare number..."
  Real-time debounced search against Supabase

[Filter row — below search bar]
  All  |  Has Active Orders  |  Exam Due

[Customer list — card]
  Columns: Name · Phone · Email · Last Order · Actions
  Each row → /customers/[id]
  [+ New Order] quick button on hover
```

**Search UX rules:**
- Minimum 2 characters before search fires
- Debounce 300ms
- Show spinner inside search field while loading
- If no results: "No customers found for '[query]'. [+ Create new customer]" — the create link pre-fills the name from the search query
- Keyboard: `↓` focuses first result, Enter opens it, Escape clears search

**Row layout:**
```
[Avatar initials]  [Full Name (bold)]     [Phone]      [Email truncated]   [Last order date]   [→]
                   [text-dark-400 city]   [mobile]
```

**Improvements needed:**
- Add `?q=` query param so search state survives page reload and can be bookmarked/shared
- Add CSV export button (admin only) in PageHeader

---

### 3.5 New Customer (`/customers/new`)

**Purpose:** Capture customer details quickly during a consultation.

**Layout:**
```
[PageHeader]
  "New Customer"
  ← Back link

[Form — single card, sectioned]

  SECTION: Personal Details
    First Name*  Last Name*
    Date of Birth

  SECTION: Contact
    Phone        Mobile
    Email

  SECTION: Address (collapsible — "Add address" toggle)
    Address Line 1
    Address Line 2
    Suburb    State    Postcode

  SECTION: Health Details (collapsible)
    Medicare Number    Medicare Ref
    Health Fund Name   Health Fund Number

  SECTION: Notes (optional)
    textarea

  [Save Customer] primary button
```

**UX rules:**
- Only Personal + Contact are visible by default. Address/Health/Notes sections expand via `+` toggle.
- Tab order: first_name → last_name → dob → phone → mobile → email → [address if expanded]
- After save → redirect to `/customers/[id]` (the new profile), not back to list

---

### 3.6 Customer Profile (`/customers/[id]`)

**Purpose:** Complete customer record. Staff's primary workspace during a consultation.

**Layout — 3 column grid (lg):**
```
Left col (1/3):           Right cols (2/3):
──────────────────────    ───────────────────────────────────
CONTACT CARD              LATEST PRESCRIPTION CARD
  phone, mobile             Rx table (OD/OS, SPH/CYL/AXIS/ADD/VA)
  email                     PD values
  DOB                       Exam date · Optometrist
  address                   [+ Add Prescription] [View all →]

HEALTH & MEDICARE CARD    ORDERS CARD
  medicare number           Count badge in header
  health fund               Each order row: number · date · status · amount · →
  fund number               [+ New Order] in header

NOTES CARD (if any)
  text-dark-300
  whitespace-pre-wrap
```

**Action bar (PageHeader):**
```
[← All Customers]   [Customer Name]   [Edit Profile]  [New Order]
```

**Improvements needed:**
- Add a **"Send Reminder" quick action** button in PageHeader (triggers a modal to create/send a manual reminder)
- Add **"Link Portal Access"** button if `portal_user_id` is null (admin only — opens a dialog to invite customer via email)
- Show **prescription expiry warning** if exam_date > 2 years ago: amber inline alert above the Rx card: "⚠ Prescription may be expired (exam was [date])"
- Add **customer lifetime value** in a subtle chip near their name: e.g. `$1,240 total orders`

---

### 3.7 Customer Edit (`/customers/[id]/edit`)

Same form layout as New Customer. Destructive zone at bottom:
```
─────────────────────────────────
DANGER ZONE  (card with red border)
  [Delete Customer] — requires typing customer name to confirm
```

---

### 3.8 Prescriptions (`/customers/[id]/prescriptions`)

**Purpose:** View and add eye exam prescriptions for a specific customer.

**Layout:**
```
[PageHeader]
  "Prescriptions — [Customer Name]"
  ← Back to profile
  Actions: [+ Add Prescription]

[Add Prescription form card — shown inline when "+ Add" is clicked, NOT a modal]

  SECTION: Exam Details
    Exam Date*    Prescription Type (select: Distance/Bifocal/Progressive/Reading)
    Prescribing Optometrist

  SECTION: Spectacle Prescription (Rx grid)

       SPH     CYL    AXIS    ADD     VA
  OD  [   ]  [   ]  [    ]  [   ]  [   ]
  OS  [   ]  [   ]  [    ]  [   ]  [   ]

  SECTION: Pupillary Distance
    PD Single  |  OR  PD Distance R / L  |  PD Near R / L

  SECTION: Contact Lens Rx (collapsible)
    OD: BC · Dia · Power · Cyl · Axis
    OS: BC · Dia · Power · Cyl · Axis

  SECTION: Notes

  [Save Prescription]

[Prescription history list — below form, ordered newest first]
  Each row is an expandable card:
  ┌─────────────────────────────────────────────────────┐
  │ 15 Jan 2025  ·  Progressive  ·  Dr Sarah Chen  [▼] │
  └─────────────────────────────────────────────────────┘
  Expanded:
    Full Rx table
    PD values
    Notes
    [Use in New Order]  [Delete]
```

**UX rules:**
- `.rx-cell` inputs: Enter/Tab moves to next cell in reading order (→ then ↓)
- Allow `+` prefix on SPH values — auto-normalise on blur
- Show `+0.00` format, `—` for empty
- Contact lens section hidden by default, shown via toggle

---

### 3.9 Eye Exams (standalone) (`/prescriptions`)

**Purpose:** Global prescriptions view — see all recent exams across all customers.

**Layout:**
```
[PageHeader]
  "Prescriptions"
  Description: "All eye exam records across all customers"

[Filter row]
  Date range  |  Prescription Type  |  Search by optometrist

[Prescriptions table — card]
  Customer  ·  Exam Date  ·  Type  ·  Optometrist  ·  Notes preview  ·  →
```

Each row links to the customer's prescriptions page (`/customers/[id]/prescriptions`).

This page is primarily useful for:
- Auditing who recently had exams
- Finding all customers seen by a specific optometrist
- Quick review before a lens lab order

---

### 3.10 Orders List (`/orders`)

**Purpose:** See and filter all orders. Status is the primary dimension.

**Layout:**
```
[PageHeader]
  "Orders"
  Actions: [+ New Order]

[Status filter tabs]
  All  |  Pending  |  Ordered  |  In Lab  |  Ready (badge count)  |  Collected

[Search + date range filter row]
  [🔍 Search order#, customer name...]   [Date from]  [Date to]

[Orders table — card]
  Order #  ·  Customer  ·  Date  ·  Collection Date  ·  Amount  ·  Status  ·  Actions

  Actions column (on hover or always visible):
    [View →]   [Print]
```

**UX rules:**
- Active status tab is reflected in `?status=` URL param for bookmark/share
- Ready orders are highlighted with a subtle `border-l-2 border-green-500` left accent
- Collection date shown in amber if it's today or past and status is not collected

---

### 3.11 New Order (`/orders/new`)

**Purpose:** Create a new optical order. Core workflow — used multiple times daily.

**Layout:**
```
[PageHeader]
  "New Order"
  ← Back

[Customer selection card]
  If no customer: CustomerSearchBar
  If customer selected: avatar + name + phone + "Change" link

[Order Form — Tabs]
  [Prescription & Lenses]  [Frame & Accessories]  [Pricing & Lab]  [Notes]
```

**Tab 1: Prescription & Lenses**
```
  SECTION: Lens Prescription (same Rx grid as above)

  SECTION: Lens Details
    Lens Type (select)   Lens Material (select)
    Lens Coating (text)  Lens Supplier (text)
    [🔍 Search GenSoft products...] — autocomplete from gensoft_products

  Note: "Load from latest prescription" → auto-fill Rx fields from customer's most recent prescription
```

**Tab 2: Frame & Accessories**
```
  SECTION: Frame
    Brand    Model
    Colour   Size
    Supplier
    [🔍 Search GenSoft frames...]

  SECTION: Accessories (dynamic list)
    [+ Add Accessory] → adds a row: name · SKU · qty · price

  SECTION: Services (dynamic list)
    [+ Add Service] → adds a row: name · price
    (examples: "Lens Fitting $20", "Anti-Fog Spray $15")
```

**Tab 3: Pricing & Lab**
```
  SECTION: Pricing
    Total Price*   [  $___  ]
    Deposit Paid   [  $___  ]
    Balance Due    [auto-calculated, read-only]

    Collection Date (date picker)
    Status (select)
    ☐ Customer acknowledged order

  SECTION: Lab
    Lab Name        Lab Order Ref
    Lab Sent Date
```

**Tab 4: Notes**
```
  Customer Notes (textarea) — "Visible to customer in portal"
  Internal Notes (textarea) — "Staff only · Never shown to customer"
```

**Save button:**
- `[Save Order]` fixed to bottom of form on mobile
- On desktop: `justify-end` flex row at bottom of form

**Improvements needed:**
- **"Load from latest Rx"** button in Lens tab that auto-populates the Rx grid from the customer's most recent prescription — single most-used shortcut in a real optical store
- **Running price total** shown in the tab bar: "Pricing & Lab ($595)" so staff can see the total without switching tabs
- **Keyboard shortcut:** `Ctrl+S` / `Cmd+S` submits the form
- Validate that collection date is not in the past when status is `pending`

---

### 3.12 Order Detail (`/orders/[id]`)

**Purpose:** View a complete order. Status updates. Print. Quick actions.

**Layout:**
```
[PageHeader]
  "Order #ARM-2024-0042"
  ← Back to orders
  Actions: [Edit]  [Print]

[Status bar — full width card with coloured left border]
  Current Status pill + status history timeline inline

[2-column grid]

Left (1/3):              Right (2/3):
──────────────────────   ────────────────────────────────
CUSTOMER CARD            PRESCRIPTION / LENS CARD
  name + contact           Rx table (OD/OS grid)
  medicare / fund          Lens type, material, coating
  link → profile           Supplier + GenSoft SKU

PRICING CARD             FRAME CARD
  Total:    $595           Brand, model, colour, size
  Deposit:  $200           Supplier + GenSoft SKU
  Balance:  $395
  Est ready: dd/mm         SERVICES & ACCESSORIES CARD (if any)

                           LAB CARD (if any)
                             lab name · ref · sent date

STATUS UPDATER (card)     NOTES CARD
  [Pending → Ordered]       Customer notes (shown to customer)
  [→ In Lab] [→ Ready]      Internal notes (staff only label)
  [→ Collected]
```

**Status updater (`OrderStatusUpdater` component):**
- Shows the 5-step progress bar visually
- Current step highlighted in gold
- Each "advance" button triggers the transition + creates a `order_status_history` row + auto-creates a reminder if status → ready

**Improvements needed:**
- Show **full status history log** with timestamp + staff name below the updater
- Add **"Send notification"** manual trigger button next to status (if customer has email)
- Show the **print** button as a prominent icon button next to Edit in PageHeader, not hidden

---

### 3.13 Order Edit (`/orders/[id]/edit`)

Same form as New Order but pre-filled. No customer search (customer is locked). "Danger zone" at bottom: [Cancel Order] and [Delete Order] (admin only).

---

### 3.14 Print Order (`/orders/[id]/print`)

**Purpose:** Print-ready A4 document: full order form + tearaway receipt. Used physically in-store.

**Screen view (before printing):**
```
Fixed top-right overlay (no-print):
  [🖨 Print / Save PDF]   [✕ Close]

White A4 page max-w-[210mm]:
  FULL ORDER DOCUMENT (top portion)
  - - - - ✂ CUSTOMER RECEIPT - - - - (tear line)
  RECEIPT SLIP (bottom portion)
```

**Full Order Document sections:**
1. **Header** — ARM OPTICS left, order# + date + status right, double border-b
2. **Customer + Pricing** — 2 columns. Customer details left, pricing table right.
3. **Prescription** — Full bordered Rx table with OD/OS rows
4. **Frame + Lenses** — 2 columns side by side
5. **Services & Accessories** — itemised table (only if present)
6. **Lab details** — if present
7. **Notes** — if present
8. **Signature line** — Customer | Staff, with lines

**Receipt Slip (tearaway):**
- Dashed border top `border-dashed border-gray-400`
- `✂ CUSTOMER RECEIPT` centred label
- Compact: ARM OPTICS branding, order#, customer name, phone, total/deposit/balance, frame summary, lens summary, est. ready date, retention instruction

**Print-specific rules:**
- `@page { margin: 15mm; }`
- `body { background: white; color: black; font-size: 11pt; }`
- `.no-print { display: none; }` hides the buttons
- Page break before receipt section on multi-page orders
- No shadows, no transparency, no dark backgrounds in print context
- All borders use `border-gray-300` not `border-white/10`

**Improvements needed:**
- Add store contact details (address, phone, ABN) to print header — currently missing
- Add a second print-only "receipt" with just the slip (via a `?slip=1` URL param or separate button "Print Receipt Only")
- Add order QR code to receipt linking to portal order status

---

### 3.15 Notifications / Reminders (`/reminders`)

**Purpose:** Monitor the automated reminder system. Manual override controls.

**Layout:**
```
[PageHeader]
  "Reminders"
  "Email notifications and scheduled reminders"

[Info banner — gold/amber]
  "Reminders sent automatically via edge function every 15 minutes"

[Filter row]
  All  |  Scheduled  |  Sent  |  Failed

[Reminders list — card]
  Icon (clock/check/✗)  ·  Type  ·  Customer link  ·  Email  ·  Scheduled  ·  Sent at
```

**Status icons:**
- `scheduled` → `<Clock className="text-yellow-400" />`
- `sent` → `<CheckCircle className="text-green-400" />`
- `failed` → `<XCircle className="text-red-400" />`
- `cancelled` → `<XCircle className="text-dark-500" />`

**Improvements needed:**
- Add **[Retry]** button on `failed` reminders
- Add **[Cancel]** button on `scheduled` reminders
- Add **[+ New Reminder]** in PageHeader: opens a modal to create a custom reminder for any customer (free-text subject/body, date picker)
- Add stats row at top: `X sent this week | Y scheduled | Z failed`

---

### 3.16 Inventory (`/inventory`)

**Purpose:** Browse the GenSoft MoneyWorks product cache.

**Layout:**
```
[PageHeader]
  "Inventory"
  "GenSoft MoneyWorks product catalogue"
  Actions: [Sync Now] (triggers gensoft-sync edge function)

[Search + filter row]
  [🔍 Search by name or SKU]   [Category filter]   [In Stock only toggle]

[Products grid — card]
  Each product row: SKU · Name · Category · Price · Stock · Last synced
```

**Improvements needed:**
- Add a **last sync timestamp** and status badge ("Synced 2h ago" / "Sync error")
- Products used in orders should show "Used in X orders" chip
- [Sync Now] should show a spinner and success/error toast

---

### 3.17 Settings (`/settings`)

**Purpose:** Platform configuration. Admin-gated sections.

**Layout — 2-column grid:**
```
[PageHeader]
  "Settings"
  "Platform configuration and staff management"

Col 1:
  MY PROFILE CARD
    Full Name
    Email
    Role
    Member since
    [Change Password] → /update-password

  EMAIL CONFIGURATION CARD
    RESEND_API_KEY (masked: re_••••••••)
    EMAIL_FROM
    [Send Test Email] button

Col 2:
  GENSOFT MONEYWORKS CARD
    API URL (masked)
    Connection status: [• Connected] or [• Error — Last error message]
    Last sync: 2h ago
    [Sync Now]

  SMS CONFIGURATION CARD (Phase 2 — shown as "Coming Soon" placeholder)
    Twilio / other provider

STAFF MEMBERS CARD (full width, admin only):
  Table: Name · Email · Role · Active · Actions
  [+ Invite Staff Member] → form/dialog to create new Supabase user
  Each row: [Edit Role] [Deactivate]
```

**Improvements needed:**
- Add real integration status indicators (ping the edge function and show live status)
- Add [Change Password] button linked to `/update-password`
- [Invite Staff Member] dialog: email input → sends Supabase invite email → creates `staff_profiles` row

---

### 3.18 Customer Portal — Login (`/portal-login`)

**Purpose:** Customer self-service entry. Mobile-first.

**Layout:** Identical structure to staff `/login` but:
- Subtitle: "Your ARM Optics Account" not "Staff Portal"
- Link at bottom: "Staff? Sign in here →"
- Magic link / OTP option preferred over password for customers (reduces friction)

**Recommended change:**
- Replace password login with **email OTP (magic link)**: customer enters email → receives 6-digit code → enters code. No password management burden for customers.

---

### 3.19 Customer Portal — Dashboard (`/portal`)

**Purpose:** Customer's personal view of their relationship with the store.

**Layout (mobile-first, max-w-lg):**
```
[Top bar]
  ARM OPTICS logo (left)  [Customer initials avatar] (right)

[Welcome section]
  "Welcome back, Sarah"
  "Your ARM Optics account"

[Contact summary card]
  Avatar initials + name + phone + email

[2-column grid (sm breakpoint)]
  RECENT ORDERS CARD       LATEST PRESCRIPTION CARD
    5 most recent            SPH / CYL / AXIS table
    each: number + status    Exam date
    [View all →]             [View all →]

[Bottom nav bar (mobile)]
  Home · Orders · Prescriptions
```

**Improvements needed:**
- Add an **order status card** at the top if any order is "ready": "🎉 Your glasses are ready for collection!" with the order number — highest-priority information
- Add store contact footer: phone, address, opening hours

---

### 3.20 Customer Portal — Orders (`/portal/orders`)

**Purpose:** Customer sees their full order history + current status.

**Layout:**
```
[Back ← ]   Orders

[Orders list — full width cards, one per order]

  ┌─────────────────────────────────────────────────┐
  │  ARM-2024-0042        15 Jan 2025               │
  │  ●●●●○  In Lab                                  │
  │  Est. ready: 22 Jan 2025                        │
  │  Total: $595  ·  Balance: $395                  │
  │  [View Details ▼]                               │
  └─────────────────────────────────────────────────┘
```

**Status progress bar (5 steps):**
```
Pending → Ordered → In Lab → Ready → Collected
  ●           ●        ●        ○        ○
```

Expanded "View Details" panel shows:
- Frame: Brand Model Colour
- Lenses: Type Material Coating
- Customer notes (internal_notes never shown)
- Contact: "Questions? Call us on (02) XXXX XXXX"

---

### 3.21 Customer Portal — Prescriptions (`/portal/prescriptions`)

**Purpose:** Customer views their prescription history.

**Layout:**
```
[Back ← ]   My Prescriptions

[Each prescription — card]

  ┌─────────────────────────────────────────────────┐
  │  15 January 2025  ·  Progressive               │
  │  Dr Sarah Chen                                  │
  │                                                 │
  │       SPH     CYL    AXIS    ADD                │
  │  OD  -1.75   -0.50   175   +2.00               │
  │  OS  -2.00   -0.25   160   +2.00               │
  │                                                 │
  │  PD: R 33.0 / L 32.5                           │
  │                                                 │
  │  [📄 Download PDF]  (future feature)            │
  └─────────────────────────────────────────────────┘
```

**Notes for patients:** Add a brief plain-language explanation below the Rx table: "SPH corrects short or long sight. CYL and AXIS correct astigmatism. ADD is for reading focus."

---

## 4. Print Design

### Print Context Rules

All print views use:
```css
@media print {
  body { background: white; color: black; font-size: 11pt; }
  .no-print { display: none; }
  @page { margin: 15mm; }
}
```

The `print/page.tsx` is a dedicated route that:
1. Renders white-on-white immediately (not the dark theme)
2. Has `min-h-screen bg-white text-black` on the outer wrapper
3. Uses `max-w-[210mm]` to simulate A4 width on screen
4. Avoids `backdrop-blur`, `opacity`, `text-white/60` and any transparency that doesn't print well

### Print Document: Full Order Form

Structure (top to bottom):
1. Header: ARM OPTICS logo text + shop contact + order# + date + status
2. Customer info (left) + Pricing table (right) — 2 columns
3. Spectacle prescription — full bordered table
4. Frame details (left) + Lens details (right) — 2 columns
5. Services & accessories itemised table
6. Lab info
7. Customer notes
8. Signature lines: Customer | Staff

### Print Document: Customer Receipt Slip

Separated by dashed tear line from the full document. Compact format:
- ARM OPTICS + order# + date
- Customer name + phone
- Frame: Brand Model Colour
- Lenses: Type Material
- Total / Deposit / Balance
- Est. ready date
- "Retain this receipt. Bring it when collecting your order."

### Print Document: Receipt Only

Accessible via `?slip=true` URL param. Renders only the receipt slip section with a smaller `@page` margin. Intended for receipt-paper printing.

---

## 5. UX Patterns & Micro-interactions

### Customer Search

Used on: Customers page, New Order, Dashboard search.

Rules:
- Minimum 2 chars before firing
- Debounce 300ms
- Display: name (bold) + phone + email + suburb in each result
- Keyboard nav: arrow keys through results, Enter to select, Escape to close
- "Not found" state includes `[+ Create new customer]` inline

### Prescription Input Grid

The `.rx-cell` grid is the most-used keyboard-intensive form in the app.

Rules:
- Enter/Tab advances left-to-right, then wraps to next row
- Accept both `+1.25` and `1.25` as positive values
- Normalise to `±0.00` format on blur
- AXIS is integer only (no decimals), range 1–180
- ADD must be positive

### Order Status Progression

Status can only advance forward (pending → ordered → in_lab → ready → collected). Regression is allowed only for admins. Each transition:
1. Updates `orders.status`
2. Inserts a row in `order_status_history` with `changed_by`, `from_status`, `to_status`, `changed_at`
3. When → `ready`: creates a `reminders` row with `reminder_type: 'glasses_ready'`, `scheduled_at: now + 1 hour`

### Toast Notifications (sonner)

- Success: green, bottom-right, auto-dismiss 3s
- Error: red, stays until dismissed
- Loading: spinner during async operations (form submits, sync triggers)

### Empty States

Every list/table has a non-generic empty state:
- Icon (relevant to content)
- Primary message: "No [things] yet."
- Secondary message: context-appropriate hint
- CTA: action button where applicable

Example: Orders page with no orders:
```
[ShoppingBag icon, text-dark-700]
"No orders yet."
"Create your first order to get started."
[+ New Order] button
```

---

## 6. Accessibility

- All form inputs have associated `<Label>` via `htmlFor`
- Focus ring: `focus:ring-2 focus:ring-gold/40` — visible on dark background
- Colour is never the only status indicator — icons + labels used alongside colour
- Print views: black text on white, minimum 11pt, no contrast issues
- Portal: minimum tap target 44×44px for mobile
- ARIA: `aria-label` on icon-only buttons, `role="status"` on loading states

---

## 7. Responsive Behaviour

### Staff App

| Breakpoint | Behaviour |
|---|---|
| `< lg` (< 1024px) | Sidebar collapses to icon-only or slides over |
| `< md` (< 768px) | Stats grid: 2 columns instead of 4 |
| `< sm` (< 640px) | Order table hides date/amount columns, shows only name+status |

### Portal App

Mobile-first throughout. Desktop gets max-w-lg centred. Bottom tab bar fixed on mobile, hidden on desktop (replaced by top nav links).

---

## 8. Navigation Map

### Staff Routes

```
/login               → Staff auth
/reset-password      → Password reset request
/update-password     → Set new password

/dashboard           → Home
/customers           → Customer list
/customers/new       → Create customer
/customers/[id]      → Customer profile
/customers/[id]/edit → Edit customer
/customers/[id]/prescriptions → Prescriptions for customer

/orders              → All orders + status filter
/orders/new          → New order form
/orders/[id]         → Order detail + status update
/orders/[id]/edit    → Edit order
/orders/[id]/print   → Print / PDF view

/prescriptions       → Global prescriptions list (all customers)
/inventory           → GenSoft product browser
/reminders           → Reminder log + manual controls
/settings            → Profile, staff, integrations
```

### Portal Routes

```
/portal-login        → Customer auth (magic link preferred)
/portal              → Customer dashboard
/portal/orders       → Order history + status
/portal/prescriptions → Prescription history
```

---

## 9. Component Inventory

### Existing (keep as-is or minor tweaks)

| Component | File | Notes |
|---|---|---|
| `Sidebar` | `components/layout/Sidebar.tsx` | Add tooltip labels for collapsed state |
| `PageHeader` | `components/layout/PageHeader.tsx` | Good pattern, use consistently |
| `CustomerSearchBar` | `components/customers/CustomerSearchBar.tsx` | Add keyboard nav |
| `OrderForm` | `components/orders/OrderForm/index.tsx` | Add "Load from Rx" shortcut |
| `LensSection` | `OrderForm/LensSection.tsx` | Good |
| `FrameSection` | `OrderForm/FrameSection.tsx` | Good |
| `PricingSection` | `OrderForm/PricingSection.tsx` | Add live balance calculation |
| `OrderStatusUpdater` | `orders/[id]/OrderStatusUpdater.tsx` | Add status history log below |

### Needs Building

| Component | Description |
|---|---|
| `StatusProgressBar` | 5-step linear progress, gold for completed, outline for future |
| `RxTable` (display) | Read-only Rx grid for profile/portal views |
| `RxGrid` (form) | Editable `.rx-cell` grid with keyboard navigation |
| `PrescriptionCard` | Expandable card for prescription history list items |
| `QuickActions` | Dashboard pill row: search, new order, new customer |
| `OrderReadyBanner` | Portal: prominent "glasses ready" call-to-action card |
| `InviteStaffDialog` | Admin dialog: email input → Supabase invite |
| `ManualReminderDialog` | Staff dialog: create ad-hoc reminder for any customer |
| `ConfirmDeleteDialog` | Reusable: type name to confirm destructive delete |
| `IntegrationStatusCard` | Shows live connection status for GenSoft + Resend |
| `PortalBottomNav` | Mobile portal bottom tab bar |
| `CollectionDateWarning` | Amber inline alert for past-due collection dates |
| `PrescriptionExpiredAlert` | Amber alert when exam_date > 2 years |

---

## 10. Design QA Checklist

Before shipping any page:

- [ ] PageHeader present with correct title, description, and action buttons
- [ ] Empty state designed and implemented
- [ ] Mobile layout tested at 375px and 768px
- [ ] All form inputs have `<Label>` elements
- [ ] Loading states: spinner on async buttons, skeleton on data fetches
- [ ] Error states: form validation errors shown inline, API errors via toast
- [ ] Print pages: tested with browser print preview at A4
- [ ] No hardcoded colours — all via Tailwind tokens
- [ ] No content obscured by sidebar (ml-60 on all staff pages)
- [ ] Status badges use the standard colour map
- [ ] Rx data always uses `tabular-nums`
- [ ] Dates formatted via `formatDate()` utility
- [ ] Currency formatted via `formatCurrency()` utility
