import type { Metadata } from "next";
import { EditorScreen } from "@/components/admin/ContentScreens";
import { requireStaff } from "@/server/admin/auth";

export const metadata: Metadata = { title: "New — Articles" };

export default async function Page() {
  const staff = await requireStaff("articles.view");
  return <EditorScreen kind="article" staff={staff} mode={{ type: "new" }} />;
}
