// src/components/Layout.tsx
import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-md px-4 pb-28 pt-8">{children}</div>
      <BottomNav />
    </div>
  );
}