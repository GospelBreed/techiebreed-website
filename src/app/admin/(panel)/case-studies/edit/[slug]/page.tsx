import type { Metadata } from "next";
import { EditorScreen } from "@/components/admin/ContentScreens";
import { requireStaff } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Edit — Case studies" };

export default async function Page({ params }: PageProps<"/admin/case-studies/edit/[slug]">) {
  const staff = await requireStaff("cases.view");
  const { slug } = await params;
  return <EditorScreen kind="case_study" staff={staff} mode={{ type: "live", slug }} />;
}
