import type { Metadata } from "next";
import { EditorScreen } from "@/components/admin/ContentScreens";
import { requireStaff } from "@/server/admin/auth";

export const metadata: Metadata = { title: "New — Case studies" };

export default async function Page() {
  const staff = await requireStaff("cases.view");
  return <EditorScreen kind="case_study" staff={staff} mode={{ type: "new" }} />;
}
