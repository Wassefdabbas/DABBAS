"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/admin/session";

export async function loginAction(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const result = await login(password);
  if (!result.ok) {
    const msg =
      result.reason === "not_configured"
        ? "Admin is not configured on this server. Set ADMIN_PASSWORD and SESSION_SECRET in .env.local."
        : "Wrong password.";
    return { error: msg };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}
