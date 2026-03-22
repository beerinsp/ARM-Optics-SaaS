"use client";
import { useState } from "react";
import { Eye, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { dict } = useLocale();
  const t = dict.auth;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher compact />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-900 shadow-md mb-4">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brand-900 font-display">ARM Optics</h1>
        </div>
        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="text-lg font-semibold text-brand-900 mb-2">{t.checkYourEmail}</h2>
              <p className="text-sm text-brand-500">
                {t.resetLinkSent} <strong className="text-brand-800">{email}</strong>
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-brand-900 mb-1">{t.resetPassword}</h2>
              <p className="text-sm text-brand-500 mb-6">{t.resetPasswordDescription}</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t.emailAddress}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@armoptics.com.au"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.sending : t.sendResetLink}
                </Button>
              </form>
            </>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-accent transition-colors">
            <ArrowLeft className="w-3 h-3" /> {t.backToSignIn}
          </Link>
        </div>
      </div>
    </div>
  );
}
