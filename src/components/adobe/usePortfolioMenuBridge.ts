"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import {
  isTrustedPortfolioOrigin,
  parseHostToIframeMessage,
  sendMenusToParent,
} from "@/lib/portfolio-channel";

import type { AdobeMenu } from "@/lib/adobe-menus";

type MenuCommandHandler = (menuLabel: string, itemLabel: string) => void;

// Whether we're framed never changes during a page's life: nothing to subscribe to.
const subscribeNever = () => () => {};
const getIsEmbedded = () => window.self !== window.top;
const getIsEmbeddedOnServer = () => false;

/**
 * Hands this app's menu bar over to the portfolio's OS-level menu bar when
 * embedded in one of its windows (see `@/lib/portfolio-channel`): sends the
 * menus up, and forwards clicked items back down to `onCommand`. Returns
 * `true` when embedded, so the caller can skip rendering its own duplicate
 * bar — it stays visible standalone (direct visit, SEO crawl).
 */
export function usePortfolioMenuBridge(
  menus: AdobeMenu[],
  onCommand?: MenuCommandHandler,
): boolean {
  // The server snapshot is `false` (no `window` there), so hydration matches
  // the server's HTML; React then re-renders with the real value if it differs.
  const isEmbedded = useSyncExternalStore(subscribeNever, getIsEmbedded, getIsEmbeddedOnServer);
  const onCommandRef = useRef(onCommand);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    if (!isEmbedded) return;

    sendMenusToParent(menus);

    function handleMessage(event: MessageEvent) {
      if (!isTrustedPortfolioOrigin(event.origin)) return;
      const message = parseHostToIframeMessage(event.data);
      if (!message) return;
      if (message.type === "request-menus") {
        sendMenusToParent(menus);
      } else {
        onCommandRef.current?.(message.menuLabel, message.itemLabel);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isEmbedded, menus]);

  return isEmbedded;
}
