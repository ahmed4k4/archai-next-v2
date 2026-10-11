"use client";

import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { PageKey } from "../visuals/PageScenes";

const META: Record<PageKey, { ar: string; en: string; symbol: string; nodes: string[] }> = {
  home: { ar: "منظومة المنتجات", en: "PRODUCT ECOSYSTEM", symbol: "◈", nodes: ["PRODUCT", "AI", "DATA"] },
  services: { ar: "منظومة الخدمات", en: "SERVICE SYSTEM", symbol: "✦", nodes: ["BUILD", "INTEGRATE", "SCALE"] },
  industries: { ar: "خريطة القطاعات", en: "INDUSTRY MAP", symbol: "⬡", nodes: ["USERS", "WORKFLOW", "DATA"] },
  about: { ar: "فريق مترابط", en: "CONNECTED TEAM", symbol: "◎", nodes: ["PEOPLE", "VALUES", "CRAFT"] },
  process: { ar: "مسار التنفيذ", en: "DELIVERY FLOW", symbol: "→", nodes: ["DISCOVER", "BUILD", "LAUNCH"] },
  insights: { ar: "مركز المعرفة", en: "KNOWLEDGE CORE", symbol: "◇", nodes: ["IDEAS", "SYSTEMS", "DECISIONS"] },
  contact: { ar: "قناة الاتصال", en: "CONTACT SIGNAL", symbol: "⌁", nodes: ["GOAL", "SCOPE", "NEXT"] },
  "case-studies": { ar: "دورة الأثر", en: "OUTCOME LOOP", symbol: "↗", nodes: ["PROBLEM", "SOLUTION", "IMPACT"] },
  careers: { ar: "شبكة التعاون", en: "COLLABORATION", symbol: "✣", nodes: ["LEARN", "CONTRIBUTE", "GROW"] },
  faq: { ar: "مركز الإجابات", en: "ANSWER CORE", symbol: "?", nodes: ["WHY", "HOW", "WHAT"] },
  project: { ar: "بنية المشروع", en: "PROJECT STACK", symbol: "▣", nodes: ["UX", "ENGINE", "SYSTEM"] },
  category: { ar: "مجموعة الحلول", en: "SOLUTION SET", symbol: "⬢", nodes: ["DISCOVER", "SELECT", "BUILD"] },
};

const NODE_POSITIONS = [
  { left: "4%", top: "24%" },
  { right: "3%", top: "45%" },
  { left: "12%", bottom: "5%" },
];

export default function ThreeDContentStage({ page, ar }: { page: PageKey; ar: boolean }) {
  const meta = META[page] ?? META.home;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "end 5%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 85, damping: 24, mass: 0.55 });

  // Scroll motion is deliberately restrained: the object should feel anchored in space,
  // while the page scroll reveals its depth rather than throwing it around.
  const rotateY = useTransform(progress, [0, 0.5, 1], [-9, 0, 9]);
  const rotateX = useTransform(progress, [0, 0.5, 1], [5, 0, -5]);
  const rotateZ = useTransform(progress, [0, 0.5, 1], [-1.2, 0, 1.2]);
  const y = useTransform(progress, [0, 0.5, 1], [28, 0, -24]);
  const z = useTransform(progress, [0, 0.5, 1], [0, 48, 0]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.93, 1.02, 0.96]);
  const depthBlur = useTransform(progress, [0, 0.5, 1], [0.35, 0, 0.22]);
  const filter = useTransform(depthBlur, (value) => `blur(${value}px)`);

  return (
    <motion.div
      ref={ref}
      className="three-d-content-stage"
      aria-hidden="true"
      style={reduce ? undefined : { rotateY, rotateX, rotateZ, y, z, scale, filter }}
    >
      <motion.div
        className="three-d-content-stage__halo"
        animate={reduce ? undefined : { rotateZ: 360, rotateX: 62, scale: [1, 1.035, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="three-d-content-stage__orbit three-d-content-stage__orbit--a"
        animate={reduce ? undefined : { rotateZ: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="three-d-content-stage__orbit three-d-content-stage__orbit--b"
        animate={reduce ? undefined : { rotateZ: -360 }}
        transition={{ duration: 27, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="three-d-content-stage__orbit three-d-content-stage__orbit--c"
        animate={reduce ? undefined : { rotateZ: 360, rotateX: [64, 58, 64] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="three-d-content-stage__core"
        animate={reduce ? undefined : {
          rotateY: [0, 7, -5, 0],
          rotateX: [0, -3, 4, 0],
          y: [0, -4, 2, 0],
          scale: [1, 1.035, 0.985, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="three-d-content-stage__core-symbol">{meta.symbol}</span>
        <span className="three-d-content-stage__core-sheen" />
        <span className="three-d-content-stage__core-dot" />
      </motion.div>

      {meta.nodes.map((node, index) => {
        const pos = NODE_POSITIONS[index];
        return (
          <motion.div
            key={node}
            className={`three-d-content-node three-d-content-node--${index + 1}`}
            style={pos}
            animate={reduce ? undefined : {
              y: [0, index === 1 ? -7 : 7, 0],
              x: [0, index === 1 ? -4 : 4, 0],
              rotateY: [index === 1 ? -5 : 5, 0, index === 1 ? -5 : 5],
              scale: [1, 1.018, 1],
            }}
            transition={{ duration: 6.5 + index * 0.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
          >
            <span className="three-d-content-node__dot" />
            <span>{node}</span>
          </motion.div>
        );
      })}

      <div className="three-d-content-stage__label">{ar ? meta.ar : meta.en}</div>
    </motion.div>
  );
}
