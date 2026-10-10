"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser";

const PARTICLES = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 29) % 100}%`,
  top: `${(i * 47) % 100}%`,
  delay: `${(i % 9) * 0.55}s`,
  duration: `${5 + (i % 7)}s`,
  size: `${2 + (i % 3)}px`,
}));

export default function AdminLogin() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const qs = useSearchParams();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 45 });

  const denied = useMemo(() => qs.get("denied") === "1", [qs]);

  useEffect(() => {
    setMounted(true);
    let active = true;
    sb.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace("/admin");
    });
    return () => { active = false; };
  }, [router, sb]);

  function handlePointer(e: React.PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) {
      const msg = authError.message || "تعذر تسجيل الدخول.";
      if (msg === "Invalid login credentials") setError("بيانات الدخول غير صحيحة. تأكد أن المستخدم موجود في Supabase → Authentication → Users، ثم شغّل 02_make_admin.sql لمنحه صلاحية الأدمن.");
      else if (msg.toLowerCase().includes("email not confirmed")) setError("البريد الإلكتروني غير مؤكد. افتح Supabase → Authentication → Users وأكّد البريد الإلكتروني، ثم جرّب مرة أخرى.");
      else setError(`${msg}${authError.code ? ` (${authError.code})` : ""}`);
      setLoading(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className={`admin-login-pro ${mounted ? "is-ready" : ""}`} dir="rtl" onPointerMove={handlePointer}>
      <div className="login-grid" aria-hidden="true" />
      <div className="login-noise" aria-hidden="true" />
      <div className="login-aurora login-aurora-a" aria-hidden="true" />
      <div className="login-aurora login-aurora-b" aria-hidden="true" />
      <div className="login-orbit login-orbit-a" aria-hidden="true" />
      <div className="login-orbit login-orbit-b" aria-hidden="true" />
      <div className="login-pointer" aria-hidden="true" style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }} />
      <div className="login-particles" aria-hidden="true">
        {PARTICLES.map((p, i) => <i key={i} style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }} />)}
      </div>

      <section className="login-stage">
        <div className="login-brandline">
          <div className="login-brandmark"><img src="/assets/logo.png" alt="Archai" /><span>ARCHAI</span></div>
          <span className="login-status"><b /> SYSTEM ONLINE</span>
        </div>

        <div className="login-layout">
          <div className="login-copy">
            <span className="login-eyebrow">PROJECT INTELLIGENCE / 01</span>
            <h1>إدارة المشاريع<br /><em>بشكل أذكى.</em></h1>
            <p>مساحة التحكم الخاصة بـ Archai لإدارة المشاريع، المحتوى، الأقسام والإحصائيات من مكان واحد.</p>
            <div className="login-metrics">
              <span><b>01</b><small>CONTROL</small></span>
              <span><b>∞</b><small>PROJECTS</small></span>
              <span><b>24/7</b><small>ACCESS</small></span>
            </div>
          </div>

          <form className="login-card-pro" onSubmit={submit}>
            <div className="login-card-glow" aria-hidden="true" />
            <div className="login-card-head">
              <div><span>SECURE ACCESS</span><h2>مرحبًا بك</h2></div>
              <div className="login-lock" aria-hidden="true">✦</div>
            </div>
            {denied && <div className="admin-error login-alert">هذا الحساب ليس لديه صلاحية Admin.</div>}
            {error && <div className="admin-error login-alert">{error}</div>}
            <label>البريد الإلكتروني
              <div className="login-input-wrap"><span>◉</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /></div>
            </label>
            <label>كلمة المرور
              <div className="login-input-wrap"><span>◆</span><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>{showPassword ? "◉" : "○"}</button></div>
            </label>
            <button className="login-submit" disabled={loading}>
              <span>{loading ? "جاري التحقق…" : "دخول لوحة التحكم"}</span><b>{loading ? "…" : "↗"}</b>
            </button>
            <div className="login-security"><span>●</span> اتصال آمن عبر Supabase Auth <span className="line" /></div>
          </form>
        </div>

        <div className="login-footer"><span>ARCHAI INTEGRATED SYSTEMS</span><span>CONTROL CENTER · v2.0</span></div>
      </section>
    </main>
  );
}
