import type { Metadata } from "next";
import { Prose } from "@/components/mdx/Prose";
import { PageHero } from "@/components/sections/PageHero";
import { allPhotos } from "@/content-data/photos";
import { pageMeta } from "@/lib/metadata";

export const metadata: Metadata = pageMeta({
  title: "Image credits",
  description: "Credits for the stock photographs used on the TechieBreed website.",
  path: "/credits",
});

function credits(): string {
  const rows = allPhotos.map((p) => `- ${p.caption}: [image by ${p.author}](${p.page}) on Magnific`).join("\n");
  return `
Photographs on our home page are free-licence images from [Magnific](https://www.magnific.com/) (formerly Freepik). We thank the photographers below.

${rows}

Screenshots and videos in [Our work](/our-work) show systems we built and are our own.
`;
}

export default function CreditsPage() {
  return (
    <>
      <PageHero eyebrow="Credits" title="Image credits" />
      <section className="container-x py-14 md:py-20">
        <div className="mx-auto max-w-[760px]">
          <Prose source={credits()} />
        </div>
      </section>
    </>
  );
}
