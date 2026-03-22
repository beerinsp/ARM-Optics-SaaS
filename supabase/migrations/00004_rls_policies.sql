-- ============================================================
-- ARM Optics CRM - Row Level Security Policies
-- ============================================================

ALTER TABLE staff_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE gensoft_products      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper Functions
-- ============================================================

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND is_active = TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_customer_id_for_portal_user()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  cid UUID;
BEGIN
  SELECT id INTO cid FROM customers WHERE portal_user_id = auth.uid() LIMIT 1;
  RETURN cid;
END;
$$;

-- ============================================================
-- STAFF PROFILES
-- ============================================================

CREATE POLICY "staff_profiles_select_staff"
  ON staff_profiles FOR SELECT
  TO authenticated
  USING (is_staff());

CREATE POLICY "staff_profiles_all_admin"
  ON staff_profiles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow users to read/update their own profile
CREATE POLICY "staff_profiles_own_record"
  ON staff_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "staff_profiles_update_own"
  ON staff_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE POLICY "customers_all_staff"
  ON customers FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "customers_select_portal"
  ON customers FOR SELECT
  TO authenticated
  USING (portal_user_id = auth.uid());

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================

CREATE POLICY "prescriptions_all_staff"
  ON prescriptions FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "prescriptions_select_portal"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    customer_id = get_customer_id_for_portal_user()
  );

-- ============================================================
-- ORDERS
-- ============================================================

CREATE POLICY "orders_all_staff"
  ON orders FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "orders_select_portal"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id = get_customer_id_for_portal_user()
  );

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================

CREATE POLICY "order_status_history_select_staff"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (is_staff());

CREATE POLICY "order_status_history_insert_staff"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

-- ============================================================
-- REMINDERS
-- ============================================================

CREATE POLICY "reminders_all_staff"
  ON reminders FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- ============================================================
-- GENSOFT PRODUCTS
-- ============================================================

CREATE POLICY "gensoft_products_select_authenticated"
  ON gensoft_products FOR SELECT
  TO authenticated
  USING (TRUE);

-- Service role handles inserts/updates via edge functions
CREATE POLICY "gensoft_products_all_service"
  ON gensoft_products FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);
