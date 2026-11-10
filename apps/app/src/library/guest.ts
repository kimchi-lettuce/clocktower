/*
 * Guest identity.
 *
 * There are no accounts: a device is a person for the length of a game
 * (docs/technical/decisions.md). The device key lives in localStorage, is
 * created on first use, and is what the server uses to work out which seat is
 * asking. Losing it means asking the Storyteller to hand the seat back, which is
 * why a seat also carries a PIN — that fallback is not built yet.
 */

const DEVICE_KEY = "clocktower.deviceKey";
const DEVICE_OVERRIDE = "clocktower.deviceOverride";
const NAME_KEY = "clocktower.name";
const GAME_KEY = "clocktower.gameId";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // A browser with storage disabled can still spectate; it just cannot claim a
    // seat or come back to it.
  }
}

/**
 * Simulating a table on one machine needs one identity per tab, and localStorage
 * is shared between tabs. `?device=ana` (localhost only) gives a tab its own
 * device key, remembered in sessionStorage so it survives navigation inside the
 * app but not a new tab. Refused anywhere but localhost, so a shared link cannot
 * hand someone a seat.
 */
function localOnlyOverride(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost");
  if (!isLocal) return null;

  const requested = new URL(window.location.href).searchParams.get("device");
  if (requested) {
    const key = `dev-${requested}`.padEnd(8, "-");
    try {
      window.sessionStorage.setItem(DEVICE_OVERRIDE, key);
    } catch {
      return key;
    }
    return key;
  }

  try {
    return window.sessionStorage.getItem(DEVICE_OVERRIDE);
  } catch {
    return null;
  }
}

export function deviceKey(): string {
  const override = localOnlyOverride();
  if (override) return override;

  const existing = read(DEVICE_KEY);
  if (existing) return existing;

  const fresh =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `device-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  write(DEVICE_KEY, fresh);
  return fresh;
}

export const rememberedName = () => read(NAME_KEY) ?? "";
export const rememberName = (name: string) => write(NAME_KEY, name.trim() || null);

export const currentGameId = () => read(GAME_KEY);
export const rememberGame = (gameId: string) => write(GAME_KEY, gameId);
export const forgetGame = () => write(GAME_KEY, null);

/** The link to send someone: the room code travels in the query string. */
export function shareLink(code: string): string {
  const url = new URL(window.location.href);
  url.pathname = "/";
  url.search = `?code=${encodeURIComponent(code)}`;
  url.hash = "";
  return url.toString();
}

export function codeFromAddress(): string {
  try {
    return (new URL(window.location.href).searchParams.get("code") ?? "").toUpperCase();
  } catch {
    return "";
  }
}
