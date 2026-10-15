"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="admin-loading">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const qs = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const denied = useMemo(() => qs.get("denied") === "1", [qs]);

  useEffect(() => {
    let active = true;
    sb.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace("/admin");
    });
    return () => {
      active = false;
    };
  }, [router, sb]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      const msg = authError.message || "Login failed.";
      if (msg === "Invalid login credentials")
        setError(
          "بيانات الدخول غير صحيحة. تأكد أن المستخدم موجود في Supabase → Authentication → Users."
        );
      else if (msg.toLowerCase().includes("email not confirmed"))
        setError("البريد الإلكتروني غير مؤكد. افتح Supabase وأكّد البريد.");
      else setError(`${msg}${authError.code ? ` (${authError.code})` : ""}`);
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-void-900 flex items-center justify-center p-6"
      dir="rtl"
    >
      {/* Background layers */}
      <div className="absolute inset-0 grid-floor opacity-40" />
      <motion.div
        className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-25"
        style={{ background: "radial-gradient(circle, #7c5cff 0%, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full blur-[140px] opacity-20"
        style={{ background: "radial-gradient(circle, #4ce2d0 0%, transparent 70%)" }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand line */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="Archai"
              className="w-10 h-10 object-contain"
            />
            <div className="font-mono text-xs font-bold tracking-[0.25em] text-white">
              ARCHAI
            </div>
          </div>
          <div className="flex items-center gap-2 text-mint-400 text-[10px] font-mono tracking-widest">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-mint-400"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            SECURE ACCESS
          </div>
        </motion.div>

        {/* Card */}
        <motion.form
          onSubmit={submit}
          className="relative p-8 rounded-3xl border border-violet-500/25 bg-void-800/85 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/* Corner glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative">
            <span className="font-mono text-[10px] tracking-widest text-mint-300">
              SECURE ACCESS
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-white">
              مرحبًا بك
            </h2>
            <p className="mt-2 text-sm text-ink-3">
              سجّل الدخول للوصول إلى لوحة التحكم.
            </p>

            {denied && (
              <div className="mt-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                هذا الحساب ليس لديه صلاحية Admin.
              </div>
            )}
            {error && (
              <div className="mt-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                {error}
              </div>
            )}

            {/* Email */}
            <label className="block mt-6">
              <span className="text-xs text-ink-3">البريد الإلكتروني</span>
              <div className="mt-2 flex items-center gap-2 px-3 py-3 rounded-xl bg-black/40 border border-violet-500/20 focus-within:border-violet-500/60 transition-colors">
                <span className="text-violet-300 text-xs">◉</span>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="flex-1 bg-transparent border-0 outline-0 text-white text-sm placeholder:text-ink-4"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block mt-4">
              <span className="text-xs text-ink-3">كلمة المرور</span>
              <div className="mt-2 flex items-center gap-2 px-3 py-3 rounded-xl bg-black/40 border border-violet-500/20 focus-within:border-violet-500/60 transition-colors">
                <span className="text-violet-300 text-xs">◆</span>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="flex-1 bg-transparent border-0 outline-0 text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "إخفاء" : "إظهار"}
                  className="text-ink-3 hover:text-violet-300 transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {/* Submit */}
            <button
              className="mt-6 w-full inline-flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-grad-cta text-white font-bold text-sm shadow-glow-violet hover:shadow-glow-violet-lg hover:-translate-y-0.5 transition-all disabled:opacity-60"
              disabled={loading}
            >
              <span>{loading ? "جاري التحقق…" : "دخول لوحة التحكم"}</span>
              <span className="text-lg">{loading ? "…" : "↗"}</span>
            </button>

            {/* Security note */}
            <div className="mt-5 flex items-center gap-2 text-[10px] font-mono text-ink-4">
              <Shield size={12} className="text-mint-400" />
              اتصال آمن عبر Supabase Auth
              <span className="flex-1 h-px bg-gradient-to-r from-violet-500/30 to-transparent" />
            </div>
          </div>
        </motion.form>

        {/* Footer */}
        <div className="mt-8 flex justify-between text-[9px] font-mono text-ink-4 tracking-widest">
          <span>ARCHAI INTEGRATED SYSTEMS</span>
          <span>CONTROL CENTER · v3.0</span>
        </div>
      </div>
    </main>
  );
}