-- ============================================================
-- ARM Optics CRM - Indexes
-- ============================================================

-- Customers
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_customers_mobile ON customers (mobile);
CREATE INDEX idx_customers_email ON customers (email);
CREATE INDEX idx_customers_last_name ON customers (last_name);
CREATE INDEX idx_customers_portal_user ON customers (portal_user_id);
CREATE INDEX idx_customers_search_vector ON customers USING GIN (search_vector);
CREATE INDEX idx_customers_phone_trgm ON customers USING GIN (phone gin_trgm_ops);
CREATE INDEX idx_customers_mobile_trgm ON customers USING GIN (mobile gin_trgm_ops);
CREATE INDEX idx_customers_email_trgm ON customers USING GIN (email gin_trgm_ops);
CREATE INDEX idx_customers_name_trgm ON customers USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

-- Orders
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_order_date ON orders (order_date DESC);
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

-- Prescriptions
CREATE INDEX idx_prescriptions_customer ON prescriptions (customer_id);
CREATE INDEX idx_prescriptions_exam_date ON prescriptions (exam_date DESC);

-- Reminders
CREATE INDEX idx_reminders_customer ON reminders (customer_id);
CREATE INDEX idx_reminders_scheduled ON reminders (scheduled_at)
  WHERE status = 'scheduled';

-- GenSoft products
CREATE INDEX idx_gensoft_products_sku ON gensoft_products (sku);
CREATE INDEX idx_gensoft_products_search ON gensoft_products USING GIN (search_vector);
CREATE INDEX idx_gensoft_products_name_trgm ON gensoft_products USING GIN (name gin_trgm_ops);
CREATE INDEX idx_gensoft_products_active ON gensoft_products (is_active) WHERE is_active = TRUE;

-- Order status history
CREATE INDEX idx_order_status_history_order ON order_status_history (order_id);
