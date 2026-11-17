import type { Metadata } from "next";
import { EditorScreen } from "@/components/admin/ContentScreens";
import { requireStaff } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Edit — Articles" };

export default async function Page({ params }: PageProps<"/admin/articles/edit/[slug]">) {
  const staff = await requireStaff("articles.view");
  const { slug } = await params;
  return <EditorScreen kind="article" staff={staff} mode={{ type: "live", slug }} />;
}
