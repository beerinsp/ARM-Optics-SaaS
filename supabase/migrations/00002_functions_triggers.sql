-- ============================================================
-- ARM Optics CRM - Functions & Triggers
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER staff_profiles_updated_at
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Customer full-text search vector
-- ============================================================

CREATE OR REPLACE FUNCTION update_customer_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    COALESCE(NEW.first_name, '') || ' ' ||
    COALESCE(NEW.last_name, '') || ' ' ||
    COALESCE(NEW.email, '') || ' ' ||
    COALESCE(NEW.phone, '') || ' ' ||
    COALESCE(NEW.mobile, '') || ' ' ||
    COALESCE(NEW.suburb, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER customers_search_vector_update
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_customer_search_vector();

-- ============================================================
-- GenSoft product full-text search vector
-- ============================================================

CREATE OR REPLACE FUNCTION update_gensoft_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.sku, '') || ' ' ||
    COALESCE(NEW.supplier, '') || ' ' ||
    COALESCE(NEW.category, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER gensoft_products_search_vector_update
  BEFORE INSERT OR UPDATE ON gensoft_products
  FOR EACH ROW EXECUTE FUNCTION update_gensoft_search_vector();

-- ============================================================
-- Auto-generate human-readable order number
-- ============================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  year_str TEXT;
  seq_num  INTEGER;
BEGIN
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.order_number := 'ARM-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_generate_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- Log order status changes
-- ============================================================

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_status_history
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ============================================================
-- Helper: calculate balance_due as a function (used in queries)
-- ============================================================

CREATE OR REPLACE FUNCTION order_balance_due(o orders)
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
  SELECT o.total_price - o.deposit_paid;
$$;
