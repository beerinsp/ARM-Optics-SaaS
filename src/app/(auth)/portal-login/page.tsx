"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocale } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "magic">("magic");
  const [magicSent, setMagicSent] = useState(false);
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.auth;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/portal` },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setMagicSent(true);
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      router.push("/portal");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher compact />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-900 shadow-md mb-4">
            <Eye className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brand-900 font-display">ARM Optics</h1>
          <p className="text-brand-500 text-sm mt-1">{t.customerPortal}</p>
        </div>

        <div className="card p-6">
          {magicSent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="text-lg font-semibold text-brand-900 mb-2">{t.checkYourEmail}</h2>
              <p className="text-sm text-brand-500">
                {t.magicLinkSent} <strong className="text-brand-800">{email}</strong>
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-brand-900 mb-1">{t.customerSignIn}</h2>
              <p className="text-sm text-brand-500 mb-6">{t.customerSignInDescription}</p>

              <div className="flex rounded-lg overflow-hidden border border-brand-200 mb-5">
                {(["magic", "login"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      mode === m ? "bg-brand-100 text-brand-900" : "text-brand-500 hover:text-brand-800"
                    }`}
                  >
                    {m === "magic" ? t.magicLink : t.passwordTab}
                  </button>
                ))}
              </div>

              {mode === "magic" ? (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t.emailAddress}</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <LogIn className="w-4 h-4" />
                    {loading ? t.sending : t.sendMagicLink}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t.emailAddress}</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">{t.password}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-800">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <LogIn className="w-4 h-4" />
                    {loading ? t.signingIn : t.signInTitle}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-brand-400 mt-6">
          {t.staffLink}{" "}
          <a href="/login" className="text-accent hover:text-accent-light transition-colors">
            {t.staffLogin}
          </a>
        </p>
      </div>
    </div>
  );
}
