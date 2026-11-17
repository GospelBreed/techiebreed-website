import type { Metadata } from "next";
import { ContentIndex } from "@/components/admin/ContentScreens";
import { requireStaff } from "@/server/admin/auth";

export const metadata: Metadata = { title: "Case studies" };

export default async function Page({ searchParams }: PageProps<"/admin/case-studies">) {
  const staff = await requireStaff("cases.view");
  return <ContentIndex kind="case_study" staff={staff} sp={await searchParams} />;
}
