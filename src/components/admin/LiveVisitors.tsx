"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LiveVisitors() {
  const sb = supabaseBrowser();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;

    async function poll() {
      // last 5 minutes sessions
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: c } = await sb
        .from("visitor_sessions")
        .select("*", { count: "exact", head: true })
        .gte("last_seen_at", since);
      if (alive) setCount(c || 0);
    }

    poll();
    const id = setInterval(poll, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [sb]);

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-mint-500/30 bg-mint-500/5"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.span
        className="w-2.5 h-2.5 rounded-full bg-mint-400"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <Activity size={14} className="text-mint-300" />
      <div className="flex-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-mint-300">
          LIVE NOW
        </div>
        <div className="text-lg font-medium text-ink-0">{count}</div>
      </div>
    </motion.div>
  );
}