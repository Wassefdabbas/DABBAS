import { redirect } from "next/navigation";
import { isAdmin, isConfigured } from "@/lib/admin/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = isConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="small-caps mb-3 text-center">DABBAS</p>
        <h1 className="mb-10 text-center text-2xl text-ink">Admin</h1>

        {configured ? (
          <LoginForm />
        ) : (
          <p className="rounded-sm border border-mist bg-pearl p-4 text-sm text-graphite">
            Admin isn&apos;t configured on this server. Set{" "}
            <code className="text-ink">ADMIN_PASSWORD</code> and{" "}
            <code className="text-ink">SESSION_SECRET</code> in{" "}
            <code className="text-ink">.env.local</code>, then restart the dev
            server.
          </p>
        )}
      </div>
    </main>
  );
}
