"use client";

import { createContext, useContext } from "react";

/** True while the incoming route is covered; LazyVisual uses it to mount every scene before reveal. */
export const VisualPreloadContext = createContext(false);
export const useVisualPreload = () => useContext(VisualPreloadContext);
