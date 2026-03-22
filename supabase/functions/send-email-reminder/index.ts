// Supabase Edge Function: send-email-reminder
// Triggered by Supabase cron every 15 minutes
// Processes scheduled reminders and sends emails via Resend

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "noreply@armoptics.com.au";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Reminder {
  id: string;
  customer_id: string;
  order_id: string | null;
  reminder_type: "glasses_ready" | "exam_due" | "custom";
  recipient_email: string | null;
  subject: string | null;
  body: string | null;
  customers: {
    first_name: string;
    last_name: string;
    email: string | null;
  };
  orders: {
    order_number: string;
  } | null;
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch due reminders
  const { data: reminders, error: fetchError } = await supabase
    .from("reminders")
    .select("*, customers(first_name, last_name, email), orders(order_number)")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(50);

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  const results = [];

  for (const reminder of (reminders ?? []) as Reminder[]) {
    const toEmail = reminder.recipient_email ?? reminder.customers?.email;
    if (!toEmail) {
      await supabase
        .from("reminders")
        .update({ status: "failed", error_message: "No recipient email" })
        .eq("id", reminder.id);
      continue;
    }

    const subject = reminder.subject ?? getDefaultSubject(reminder);
    const html = reminder.body ?? getDefaultEmailBody(reminder);

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [toEmail],
          subject,
          html,
        }),
      });

      if (res.ok) {
        await supabase
          .from("reminders")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", reminder.id);
        results.push({ id: reminder.id, status: "sent" });
      } else {
        const errText = await res.text();
        await supabase
          .from("reminders")
          .update({ status: "failed", error_message: errText })
          .eq("id", reminder.id);
        results.push({ id: reminder.id, status: "failed", error: errText });
      }
    } catch (err) {
      await supabase
        .from("reminders")
        .update({ status: "failed", error_message: String(err) })
        .eq("id", reminder.id);
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

function getDefaultSubject(reminder: Reminder): string {
  const name = reminder.customers?.first_name ?? "Valued Customer";
  switch (reminder.reminder_type) {
    case "glasses_ready":
      return `Your glasses are ready – ${reminder.orders?.order_number ?? "ARM Optics"}`;
    case "exam_due":
      return `Time for your eye exam – ARM Optics`;
    default:
      return `Message from ARM Optics`;
  }
}

function getDefaultEmailBody(reminder: Reminder): string {
  const name = reminder.customers?.first_name ?? "Valued Customer";
  const orderNum = reminder.orders?.order_number;

  switch (reminder.reminder_type) {
    case "glasses_ready":
      return `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h2 style="color: #1a1a1a;">Your glasses are ready! 🎉</h2>
          <p>Hi ${name},</p>
          <p>Great news — your order${orderNum ? ` <strong>${orderNum}</strong>` : ""} is ready for collection at ARM Optics.</p>
          <p>Please bring this email or your receipt slip when you come to collect.</p>
          <p style="margin-top: 24px; color: #666; font-size: 13px;">
            ARM Optics | Your vision, our expertise.
          </p>
        </div>
      `;
    case "exam_due":
      return `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h2 style="color: #1a1a1a;">Time for your eye exam 👁️</h2>
          <p>Hi ${name},</p>
          <p>It's time to book your next eye examination. Regular check-ups help protect your vision and ensure your prescription is up to date.</p>
          <p>Contact us to schedule your appointment at a time that suits you.</p>
          <p style="margin-top: 24px; color: #666; font-size: 13px;">
            ARM Optics | Your vision, our expertise.
          </p>
        </div>
      `;
    default:
      return `<p>Hi ${name}, this is a message from ARM Optics.</p>`;
  }
}
