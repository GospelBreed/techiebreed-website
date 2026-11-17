import type { Metadata } from "next";
import { ContentIndex } from "@/components/admin/ContentScreens";
import { requireStaff } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Articles" };

export default async function Page({ searchParams }: PageProps<"/admin/articles">) {
  const staff = await requireStaff("articles.view");
  return <ContentIndex kind="article" staff={staff} sp={await searchParams} />;
}
