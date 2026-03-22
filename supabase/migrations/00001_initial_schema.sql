-- ============================================================
-- ARM Optics CRM - Initial Schema
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE order_status AS ENUM (
  'pending',
  'in_progress',
  'lab_sent',
  'ready',
  'collected',
  'cancelled'
);

CREATE TYPE prescription_type AS ENUM (
  'distance',
  'near',
  'bifocal',
  'progressive',
  'contact_lens'
);

CREATE TYPE reminder_type AS ENUM (
  'glasses_ready',
  'exam_due',
  'custom'
);

CREATE TYPE reminder_status AS ENUM (
  'scheduled',
  'sent',
  'failed',
  'cancelled'
);

CREATE TYPE staff_role AS ENUM (
  'admin',
  'optometrist',
  'dispenser',
  'receptionist'
);

-- ============================================================
-- STAFF PROFILES
-- ============================================================

CREATE TABLE staff_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  role          staff_role NOT NULL DEFAULT 'receptionist',
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE customers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  date_of_birth         DATE,
  email                 TEXT,
  phone                 TEXT,
  mobile                TEXT,
  address_line1         TEXT,
  address_line2         TEXT,
  suburb                TEXT,
  state                 TEXT,
  postcode              TEXT,
  country               TEXT DEFAULT 'Australia',
  portal_user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gensoft_customer_id   TEXT,
  medicare_number       TEXT,
  dva_number            TEXT,
  health_fund_name      TEXT,
  health_fund_number    TEXT,
  health_fund_ref       TEXT,
  notes                 TEXT,
  search_vector         TSVECTOR,
  created_by            UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================

CREATE TABLE prescriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id           UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  prescription_type     prescription_type NOT NULL DEFAULT 'distance',
  exam_date             DATE NOT NULL,
  next_exam_date        DATE,
  prescribing_optom     TEXT,
  -- Right eye (OD)
  od_sph                NUMERIC(5,2),
  od_cyl                NUMERIC(5,2),
  od_axis               SMALLINT CHECK (od_axis BETWEEN 0 AND 180),
  od_add                NUMERIC(4,2),
  od_va                 TEXT,
  -- Left eye (OS)
  os_sph                NUMERIC(5,2),
  os_cyl                NUMERIC(5,2),
  os_axis               SMALLINT CHECK (os_axis BETWEEN 0 AND 180),
  os_add                NUMERIC(4,2),
  os_va                 TEXT,
  -- Pupillary Distance
  pd_distance_right     NUMERIC(4,1),
  pd_distance_left      NUMERIC(4,1),
  pd_near_right         NUMERIC(4,1),
  pd_near_left          NUMERIC(4,1),
  pd_single             NUMERIC(4,1),
  -- Contact lens specific
  cl_od_brand           TEXT,
  cl_od_base_curve      NUMERIC(4,2),
  cl_od_diameter        NUMERIC(4,1),
  cl_od_power           NUMERIC(5,2),
  cl_od_cylinder        NUMERIC(4,2),
  cl_od_axis            SMALLINT,
  cl_os_brand           TEXT,
  cl_os_base_curve      NUMERIC(4,2),
  cl_os_diameter        NUMERIC(4,1),
  cl_os_power           NUMERIC(5,2),
  cl_os_cylinder        NUMERIC(4,2),
  cl_os_axis            SMALLINT,
  notes                 TEXT,
  recorded_by           UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number          TEXT NOT NULL UNIQUE DEFAULT '',
  customer_id           UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  prescription_id       UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  status                order_status NOT NULL DEFAULT 'pending',
  order_date            DATE NOT NULL DEFAULT CURRENT_DATE,
  collection_date       DATE,
  -- Rx at time of order (snapshot)
  lens_od_sph           NUMERIC(5,2),
  lens_od_cyl           NUMERIC(5,2),
  lens_od_axis          SMALLINT,
  lens_od_add           NUMERIC(4,2),
  lens_os_sph           NUMERIC(5,2),
  lens_os_cyl           NUMERIC(5,2),
  lens_os_axis          SMALLINT,
  lens_os_add           NUMERIC(4,2),
  pd_distance_right     NUMERIC(4,1),
  pd_distance_left      NUMERIC(4,1),
  pd_near_right         NUMERIC(4,1),
  pd_near_left          NUMERIC(4,1),
  pd_single             NUMERIC(4,1),
  -- Frame
  frame_supplier        TEXT,
  frame_brand           TEXT,
  frame_model           TEXT,
  frame_colour          TEXT,
  frame_size            TEXT,
  frame_gensoft_sku     TEXT,
  -- Lens product
  lens_type             TEXT,
  lens_material         TEXT,
  lens_coating          TEXT,
  lens_supplier         TEXT,
  lens_gensoft_sku      TEXT,
  -- Services (JSONB array [{name, price}])
  services              JSONB NOT NULL DEFAULT '[]',
  -- Accessories (JSONB array [{name, sku, qty, price}])
  accessories           JSONB NOT NULL DEFAULT '[]',
  -- Pricing
  total_price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_paid          NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Lab
  lab_name              TEXT,
  lab_order_ref         TEXT,
  lab_sent_date         DATE,
  -- Customer signature/acknowledgement
  customer_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at       TIMESTAMPTZ,
  -- Notes
  notes                 TEXT,
  internal_notes        TEXT,
  created_by            UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  updated_by            UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================

CREATE TABLE order_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status   order_status,
  to_status     order_status NOT NULL,
  changed_by    UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REMINDERS
-- ============================================================

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

-- ============================================================
-- GENSOFT PRODUCTS CACHE
-- ============================================================

CREATE TABLE gensoft_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  category        TEXT,
  supplier        TEXT,
  cost_price      NUMERIC(10,2),
  sell_price      NUMERIC(10,2),
  stock_qty       INTEGER,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  raw_data        JSONB,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_vector   TSVECTOR
);
