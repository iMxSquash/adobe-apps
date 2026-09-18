import type { AdobeMenu } from "@/lib/adobe-menus";

/**
 * `postMessage` protocol with the portfolio shell (elwen.dev) — this app runs
 * embedded in one of its windows as an `<iframe>` (see os-apps skill,
 * `../portfolio/src/lib/iframe-app-channel.ts`). Both sides must stay in
 * sync; there's no shared package between the two repos, so this file is a
 * deliberate mirror of the portfolio's copy, not a generic protocol of our
 * own. Today it only carries menu-bar content/commands.
 */
const CHANNEL = "elwen-os" as const;

type PortfolioMenuItem = { label: string; shortcut?: string };
type PortfolioMenuSeparator = { separator: true };
type PortfolioMenuEntry = PortfolioMenuItem | PortfolioMenuSeparator;
type PortfolioMenu = { label: string; items: PortfolioMenuEntry[] };

type MenusMessage = { channel: typeof CHANNEL; type: "menus"; menus: PortfolioMenu[] };
type RequestMenusMessage = { channel: typeof CHANNEL; type: "request-menus" };
type MenuCommandMessage = {
  channel: typeof CHANNEL;
  type: "menu-command";
  menuLabel: string;
  itemLabel: string;
};
type HostToIframeMessage = RequestMenusMessage | MenuCommandMessage;

const TRUSTED_PORTFOLIO_ORIGINS = ["https://elwen.dev", "https://www.elwen.dev"];

/** Dev only: the portfolio's own `next dev` runs on an arbitrary localhost port next to this app's. */
function isDevPortfolioOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === "http:" && hostname === "localhost";
  } catch {
    return false;
  }
}

export function isTrustedPortfolioOrigin(origin: string): boolean {
  return TRUSTED_PORTFOLIO_ORIGINS.includes(origin) || isDevPortfolioOrigin(origin);
}

/** `AdobeMenu`'s `"-"` string sentinel becomes a real separator entry for the portfolio's shape. */
function toPortfolioMenus(menus: AdobeMenu[]): PortfolioMenu[] {
  return menus.map((menu) => ({
    label: menu.label,
    items: menu.items.map((item): PortfolioMenuEntry =>
      item === "-" ? { separator: true } : { label: item },
    ),
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Never trust a `postMessage` payload by shape alone — validates every field before the caller acts on it. */
export function parseHostToIframeMessage(data: unknown): HostToIframeMessage | null {
  if (!isRecord(data) || data.channel !== CHANNEL) return null;
  if (data.type === "request-menus") return { channel: CHANNEL, type: "request-menus" };
  if (
    data.type === "menu-command" &&
    typeof data.menuLabel === "string" &&
    typeof data.itemLabel === "string"
  ) {
    return {
      channel: CHANNEL,
      type: "menu-command",
      menuLabel: data.menuLabel,
      itemLabel: data.itemLabel,
    };
  }
  return null;
}

/**
 * The portfolio's own origin, trusted via `document.referrer` (set to the
 * parent page's URL when embedded) rather than a wildcard `postMessage`
 * target — `null` when not embedded, or embedded in something untrusted.
 */
function trustedParentOrigin(): string | null {
  if (typeof window === "undefined" || window.self === window.top) return null;
  try {
    const origin = new URL(document.referrer).origin;
    return isTrustedPortfolioOrigin(origin) ? origin : null;
  } catch {
    return null;
  }
}

export function sendMenusToParent(menus: AdobeMenu[]): void {
  const targetOrigin = trustedParentOrigin();
  if (!targetOrigin) return;
  const message: MenusMessage = { channel: CHANNEL, type: "menus", menus: toPortfolioMenus(menus) };
  window.parent.postMessage(message, targetOrigin);
}
