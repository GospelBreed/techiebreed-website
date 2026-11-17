import type { Metadata } from "next";
import { EditorScreen } from "@/components/admin/ContentScreens";
import { requireStaff } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Draft — Articles" };

export default async function Page({ params }: PageProps<"/admin/articles/draft/[id]">) {
  const staff = await requireStaff("articles.view");
  const { id } = await params;
  return <EditorScreen kind="article" staff={staff} mode={{ type: "draft", id }} />;
}
