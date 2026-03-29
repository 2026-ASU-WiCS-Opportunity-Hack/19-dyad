"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@propelauth/nextjs/client";

export function AuthProviderShell({
  authUrl,
  children
}: {
  authUrl: string;
  children: ReactNode;
}) {
  return <AuthProvider authUrl={authUrl}>{children}</AuthProvider>;
}
