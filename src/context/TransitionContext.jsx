"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const TransitionContext = createContext(null);

/**
 * TransitionProvider
 * ควบคุม overlay animation ระหว่าง page navigation
 * Flow: show overlay (350ms) → navigate → keep visible (500ms) → hide overlay
 */
export function TransitionProvider({ children }) {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const router = useRouter();

  const navigateTo = useCallback(
    (path) => {
      setIsOverlayVisible(true);

      // รอ overlay ไหลเข้าเต็มที่ก่อน navigate
      setTimeout(() => {
        router.push(path);

        // คง overlay ไว้ระหว่างที่หน้าใหม่โหลด แล้วค่อยซ่อน
        setTimeout(() => {
          setIsOverlayVisible(false);
        }, 500);
      }, 350);
    },
    [router],
  );

  return (
    <TransitionContext.Provider value={{ isOverlayVisible, navigateTo }}>
      {children}
    </TransitionContext.Provider>
  );
}

export const usePageTransition = () => useContext(TransitionContext);
