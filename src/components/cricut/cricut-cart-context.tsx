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

import { CRICUT_CART_STORAGE_KEY } from "@/config/cricut-shop";

export type CricutCartLine = {
  itemId: string;
  title: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
};

type CricutCartContextValue = {
  lines: CricutCartLine[];
  count: number;
  subtotalCents: number;
  addItem: (item: Omit<CricutCartLine, "quantity">, qty?: number) => void;
  setQty: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  replaceWithBuyNow: (item: Omit<CricutCartLine, "quantity">, qty?: number) => void;
};

const CricutCartContext = createContext<CricutCartContextValue | null>(null);

function readCart(): CricutCartLine[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CRICUT_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CricutCartLine[];
    return Array.isArray(parsed) ? parsed : [];
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

  const addItem = useCallback(
    (item: Omit<CricutCartLine, "quantity">, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.itemId === item.itemId);
        if (existing) {
          return prev.map((l) =>
            l.itemId === item.itemId
              ? { ...l, quantity: Math.min(99, l.quantity + qty) }
              : l,
          );
        }
        return [...prev, { ...item, quantity: Math.min(99, qty) }];
      });
    },
    [],
  );

  const replaceWithBuyNow = useCallback(
    (item: Omit<CricutCartLine, "quantity">, qty = 1) => {
      setLines([{ ...item, quantity: Math.min(99, qty) }]);
    },
    [],
  );

  const setQty = useCallback((itemId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.itemId === itemId
            ? { ...l, quantity: Math.max(0, Math.min(99, quantity)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setLines((prev) => prev.filter((l) => l.itemId !== itemId));
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
