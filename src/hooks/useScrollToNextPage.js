import { useEffect, useRef } from "react";
import { usePageTransition } from "../context/TransitionContext";

/**
 * useScrollToNextPage
 * ดัก wheel + touch event เมื่อ user อยู่ที่ก้นหน้า
 * → เรียก navigateTo(nextPath) ผ่าน TransitionContext (มี overlay)
 *
 * @param {string | null} nextPath - Route ถัดไป เช่น '/about' หรือ '/projects'
 *                                   ถ้า null → hook ไม่ทำงาน
 */
export function useScrollToNextPage(nextPath) {
  const { navigateTo } = usePageTransition();
  const triggered = useRef(false);

  useEffect(() => {
    if (!nextPath) return;

    // Reset ทุกครั้งที่ mount (เปลี่ยนหน้าใหม่)
    triggered.current = false;

    const isAtBottom = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      return scrollBottom >= pageHeight - 10;
    };

    const isShortPage = () => {
      return document.documentElement.scrollHeight <= window.innerHeight + 10;
    };

    const trigger = () => {
      if (triggered.current) return;
      triggered.current = true;
      navigateTo(nextPath);
    };

    // Desktop: wheel event
    const handleWheel = (e) => {
      if (triggered.current) return;
      // deltaY > 20 กัน trackpad scroll เล็กๆ โดยบังเอิญ
      if ((isAtBottom() || isShortPage()) && e.deltaY > 20) {
        trigger();
      }
    };

    // Mobile: touch swipe up
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (triggered.current) return;
      const swipeDistance = touchStartY - e.changedTouches[0].clientY;
      // swipe up > 50px ที่ก้นหน้า
      if ((isAtBottom() || isShortPage()) && swipeDistance > 50) {
        trigger();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [nextPath, navigateTo]);
}
