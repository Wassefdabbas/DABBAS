"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin/session";
import {
  updateAppointmentStatus,
  deleteAppointment,
  type AppointmentStatus,
} from "@/lib/appointments";

async function gate() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

export async function setAppointmentStatusAction(
  id: string,
  status: AppointmentStatus,
) {
  await gate();
  await updateAppointmentStatus(id, status);
  revalidatePath("/admin/appointments", "page");
}

export async function deleteAppointmentAction(id: string) {
  await gate();
  await deleteAppointment(id);
  revalidatePath("/admin/appointments", "page");
}
