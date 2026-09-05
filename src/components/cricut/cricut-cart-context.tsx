"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  CRICUT_DEFAULT_PRINT_FONT,
  cricutCartLineKey,
  parseCricutPrintFontKey,
  parseCricutSportSlug,
  sanitizeCricutPrintName,
  type CricutPrintFontKey,
} from "@/config/cricut-customization";
import { CRICUT_CART_STORAGE_KEY } from "@/config/cricut-shop";

export type CricutCartLine = {
  lineKey: string;
  itemId: string;
  title: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
  sportSlug: string | null;
  printName: string;
  fontKey: CricutPrintFontKey | null;
  designImageUrl: string | null;
  designStoragePath: string | null;
};

export type CricutCartItemInput = Omit<CricutCartLine, "quantity" | "lineKey"> & {
  lineKey?: string;
};

type CricutCartContextValue = {
  lines: CricutCartLine[];
  count: number;
  subtotalCents: number;
  addItem: (item: CricutCartItemInput, qty?: number) => void;
  setQty: (lineKey: string, quantity: number) => void;
  removeItem: (lineKey: string) => void;
  clear: () => void;
  replaceWithBuyNow: (item: CricutCartItemInput, qty?: number) => void;
};

const CricutCartContext = createContext<CricutCartContextValue | null>(null);

function normalizeLine(
  raw: Partial<CricutCartLine> & { itemId?: string },
): CricutCartLine | null {
  const itemId = String(raw.itemId ?? "");
  if (!itemId) return null;
  const printName = sanitizeCricutPrintName(raw.printName);
  const sportSlug = parseCricutSportSlug(raw.sportSlug);
  const fontKey = parseCricutPrintFontKey(raw.fontKey ?? "") ??
    (printName ? CRICUT_DEFAULT_PRINT_FONT : null);
  const designImageUrl = raw.designImageUrl?.trim() || null;
  const designStoragePath = raw.designStoragePath?.trim() || null;
  const customization = {
    sportSlug,
    printName,
    fontKey,
    designImageUrl,
    designStoragePath,
  };
  return {
    lineKey: raw.lineKey || cricutCartLineKey(itemId, customization),
    itemId,
    title: String(raw.title ?? "Cricut item"),
    priceCents: Number(raw.priceCents ?? 0),
    imageUrl: raw.imageUrl ?? null,
    quantity: Math.max(1, Math.min(99, Number(raw.quantity ?? 1) || 1)),
    ...customization,
  };
}

function readCart(): CricutCartLine[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CRICUT_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => normalizeLine(row as Partial<CricutCartLine>))
      .filter((line): line is CricutCartLine => Boolean(line));
  } catch {
    return [];
  }
}

export function CricutCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CricutCartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CRICUT_CART_STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem = useCallback((item: CricutCartItemInput, qty = 1) => {
    const next = normalizeLine({ ...item, quantity: qty });
    if (!next) return;
    setLines((prev) => {
      const existing = prev.find((l) => l.lineKey === next.lineKey);
      if (existing) {
        return prev.map((l) =>
          l.lineKey === next.lineKey
            ? { ...l, quantity: Math.min(99, l.quantity + qty) }
            : l,
        );
      }
      return [...prev, next];
    });
  }, []);

  const replaceWithBuyNow = useCallback((item: CricutCartItemInput, qty = 1) => {
    const next = normalizeLine({ ...item, quantity: qty });
    if (!next) return;
    setLines([next]);
  }, []);

  const setQty = useCallback((lineKey: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.lineKey === lineKey
            ? { ...l, quantity: Math.max(0, Math.min(99, quantity)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((lineKey: string) => {
    setLines((prev) => prev.filter((l) => l.lineKey !== lineKey));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CricutCartContextValue>(() => {
    const subtotalCents = lines.reduce(
      (sum, l) => sum + l.priceCents * l.quantity,
      0,
    );
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    return {
      lines,
      count,
      subtotalCents,
      addItem,
      setQty,
      removeItem,
      clear,
      replaceWithBuyNow,
    };
  }, [lines, addItem, setQty, removeItem, clear, replaceWithBuyNow]);

  return (
    <CricutCartContext.Provider value={value}>
      {children}
    </CricutCartContext.Provider>
  );
}

export function useCricutCart() {
  const ctx = useContext(CricutCartContext);
  if (!ctx) {
    throw new Error("useCricutCart must be used within CricutCartProvider");
  }
  return ctx;
}
