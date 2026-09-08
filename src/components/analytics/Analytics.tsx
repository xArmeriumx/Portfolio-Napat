"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { interactionEvent, publicAnalyticsPath } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (..._args: unknown[]) => void;
    portfolioAnalytics?: { path: string | null; id: string };
  }
}
const key = "portfolio-analytics-consent";
function snapshot() {
  try { return localStorage.getItem(key) || "unknown"; } catch { return "unknown"; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(key, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(key, callback); };
}
function choose(value: "granted" | "denied") {
  try { localStorage.setItem(key, value); } catch { return; }
  window.dispatchEvent(new Event(key));
  // Reload on withdrawal to remove the loaded Google runtime entirely.
  if (value === "denied" && window.portfolioAnalytics) window.location.reload();
}

export default function Analytics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribe, snapshot, () => "unknown");
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
  const enabled = /^G-[A-Z0-9]+$/.test(id);
  const publicPath = publicAnalyticsPath(pathname);
  useEffect(() => {
    if (enabled) (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = !publicPath || consent !== "granted";
    if (!enabled || !publicPath || consent !== "granted") return;
    window.dataLayer ||= [];
    // Google gtag consumes an Arguments object, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.gtag ||= function () { window.dataLayer.push(arguments); };
    if (!window.portfolioAnalytics) {
      window.portfolioAnalytics = { path: null, id };
      window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      window.gtag("js", new Date());
      window.gtag("config", id, { send_page_view: false, page_location: `${window.location.origin}${publicPath}`, page_referrer: "", allow_google_signals: false, allow_ad_personalization_signals: false });
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);
    }
    if (window.portfolioAnalytics.path !== publicPath) {
      const previous = window.portfolioAnalytics.path;
      window.portfolioAnalytics.path = publicPath;
      window.gtag("event", "page_view", {
        page_location: `${window.location.origin}${publicPath}`,
        page_referrer: previous ? `${window.location.origin}${previous}` : "",
        page_title: publicPath,
        locale: publicPath === "/th" || publicPath.startsWith("/th/") ? "th" : "en",
      });
    }
    function click(event: MouseEvent) {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || snapshot() !== "granted") return;
      const name = interactionEvent(anchor.href, window.location.origin, publicPath, anchor.hasAttribute("download") && /resume|cv/i.test(anchor.pathname));
      if (name) window.gtag("event", name, { page_path: publicPath, locale: publicPath.startsWith("/th") ? "th" : "en" });
    }
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [enabled, id, publicPath, consent]);
  if (!enabled || !publicPath) return null;
  const thai = pathname === "/th" || pathname.startsWith("/th/");
  return <aside aria-label={thai ? "การวิเคราะห์การใช้งาน" : "Analytics preferences"} className="relative z-50 border-t bg-white px-4 py-3 text-center text-sm text-gray-700">
    {consent === "unknown" ? <>
      <p>{thai ? "อนุญาตให้ใช้ Google Analytics วัดการเข้าชมและการคลิกลิงก์หรือไม่? ไม่ส่งเนื้อหาแบบฟอร์มหรือข้อมูลติดต่อ" : "Allow Google Analytics to measure visits and link clicks? Form content and contact details are not sent."}</p>
      <button className="m-2 underline" onClick={() => choose("granted")}>{thai ? "อนุญาต" : "Allow analytics"}</button>
      <button className="m-2 underline" onClick={() => choose("denied")}>{thai ? "ไม่อนุญาต" : "Decline"}</button>
    </> : <button className="underline" onClick={() => choose(consent === "granted" ? "denied" : "granted")}>{thai ? (consent === "granted" ? "ปิดการวิเคราะห์การใช้งาน" : "เปิดการวิเคราะห์การใช้งาน") : (consent === "granted" ? "Disable analytics" : "Enable analytics")}</button>}
  </aside>;
}
