"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), { ssr: false, loading: () => null });

export default function Hero3DPortal() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setMount(document.getElementById("hero3dMount"));
  }, []);
  if (!mount) return null;
  return createPortal(<Hero3DScene />, mount);
}
