import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Bell, Mail, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Reminder } from "@/types/database";

type ReminderWithCustomer = Reminder & {
  customers: { id: string; first_name: string; last_name: string } | null;
};

export default async function RemindersPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.reminders;

  const supabase = await createClient();

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*, customers(id, first_name, last_name)")
    .order("scheduled_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-100 bg-brand-50/40">
          <Bell className="w-4 h-4 text-accent" />
          <p className="text-sm text-brand-700">
            {t.autoSent}
          </p>
        </div>

        {!reminders || reminders.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-brand-400 mx-auto mb-3" />
            <p className="text-brand-500 text-sm">{t.noReminders}</p>
            <p className="text-brand-400 text-xs mt-1">
              {t.autoCreated}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brand-100">
            {(reminders as ReminderWithCustomer[]).map((reminder) => (
              <div key={reminder.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-shrink-0">
                  {reminder.status === "scheduled" && <Clock className="w-4 h-4 text-yellow-400" />}
                  {reminder.status === "sent" && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {reminder.status === "failed" && <XCircle className="w-4 h-4 text-red-400" />}
                  {reminder.status === "cancelled" && <XCircle className="w-4 h-4 text-brand-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-brand-900">
                      {dict.enums.reminderType[reminder.reminder_type as keyof typeof dict.enums.reminderType] ?? reminder.reminder_type}
                    </p>
                    {reminder.customers && (
                      <Link
                        href={`/customers/${reminder.customers.id}`}
                        className="text-xs text-brand-500 hover:text-accent transition-colors"
                      >
                        {reminder.customers.first_name} {reminder.customers.last_name}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {reminder.recipient_email && (
                      <span className="flex items-center gap-1 text-xs text-brand-400">
                        <Mail className="w-3 h-3" /> {reminder.recipient_email}
                      </span>
                    )}
                    {reminder.subject && (
                      <span className="text-xs text-brand-400 truncate">{reminder.subject}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-brand-500">{formatDate(reminder.scheduled_at)}</p>
                  {reminder.sent_at && (
                    <p className="text-xs text-green-500">{t.sentOn} {formatDate(reminder.sent_at)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
