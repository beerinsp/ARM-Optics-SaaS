import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendGlassesReadyEmail } from "@/lib/email";
import { getLocale } from "@/lib/i18n";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch order with customer
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, status, customers(id, first_name, last_name, email)")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const customer = order.customers as unknown as { id: string; first_name: string; last_name: string; email: string | null };

  if (!customer?.email) {
    return NextResponse.json({ error: "Customer has no email address" }, { status: 422 });
  }

  // Create reminder record
  const { data: reminder, error: reminderError } = await supabase
    .from("reminders")
    .insert({
      customer_id: customer.id,
      order_id: order.id,
      reminder_type: "glasses_ready",
      recipient_email: customer.email,
      subject: `Your glasses are ready – ${order.order_number}`,
      scheduled_at: new Date().toISOString(),
      status: "scheduled",
    })
    .select("id")
    .single();

  if (reminderError) {
    return NextResponse.json({ error: reminderError.message }, { status: 500 });
  }

  // Send immediately via Resend
  const locale = await getLocale();
  const { error: sendError } = await sendGlassesReadyEmail({
    to: customer.email,
    customerFirstName: customer.first_name,
    orderNumber: order.order_number,
    locale,
  });

  if (sendError) {
    await supabase
      .from("reminders")
      .update({ status: "failed", error_message: sendError.message })
      .eq("id", reminder.id);
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  await supabase
    .from("reminders")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", reminder.id);

  return NextResponse.json({ success: true });
}
