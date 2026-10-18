"use client";

import { createContext, useContext } from "react";

/** True while the incoming route is covered; desktop scenes are queued and primed before reveal. */
export const VisualPreloadContext = createContext(false);
export const useVisualPreload = () => useContext(VisualPreloadContext);
