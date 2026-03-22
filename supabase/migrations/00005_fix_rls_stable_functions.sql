-- ============================================================
-- ARM Optics CRM — Performance: Mark RLS helper functions STABLE
-- ============================================================
--
-- Without STABLE, PostgreSQL treats these plpgsql functions as VOLATILE,
-- which forces re-evaluation on every row during RLS checks.
-- For a 25-row orders fetch, is_staff() was called 25 times, each doing
-- a sub-SELECT against staff_profiles.
--
-- STABLE tells the planner the result is constant within a single query,
-- so it is evaluated once and the result is cached for the query duration.
--
-- Impact: O(n) → O(1) sub-queries per RLS-checked table access.

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND is_active = TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_customer_id_for_portal_user()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  cid UUID;
BEGIN
  SELECT id INTO cid FROM customers WHERE portal_user_id = auth.uid() LIMIT 1;
  RETURN cid;
END;
$$;
