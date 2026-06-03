import { redirect } from "next/navigation";
import { isAdmin } from "./session";

/**
 * Server-component guard. Use at the top of any /admin page server component
 * (other than /admin/login):
 *
 *   export default async function Page() {
 *     await requireAdmin();
 *     // ...
 *   }
 */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
