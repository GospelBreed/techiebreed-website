import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type MDXComponents = NonNullable<Parameters<typeof MDXRemote>[0]["components"]>;

function slugify(children: ReactNode): string | undefined {
  const text = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
  return text ? text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : undefined;
}

function SmartLink({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const cls = "font-medium text-leaf underline decoration-leaf/40 underline-offset-4 transition-colors hover:text-forest hover:decoration-forest";
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} rel="noopener noreferrer" target="_blank" {...rest}>
      {children}
    </a>
  );
}

/** Typography for MDX bodies, in the site's type system. */
const base: MDXComponents = {
  h2: ({ children }) => (
    <h2
      id={slugify(children)}
      className="mt-14 scroll-mt-28 font-display text-[26px] leading-[1.2] font-semibold tracking-[-0.01em] text-forest first:mt-0 md:text-[32px]"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mt-8 text-[20px] leading-[1.35] font-bold text-ink">{children}</h3>,
  p: ({ children }) => <p className="mt-4 text-[17px] leading-[1.75] text-ink-soft">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-4 space-y-2 pl-1 text-[17px] leading-[1.7] text-ink-soft [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:top-[0.7em] [&>li]:before:left-0 [&>li]:before:size-2 [&>li]:before:rotate-45 [&>li]:before:rounded-[2px] [&>li]:before:bg-sprout">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-[17px] leading-[1.7] text-ink-soft marker:font-semibold marker:text-leaf">
      {children}
    </ol>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  a: SmartLink,
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-4 border-sprout pl-6 font-display text-[22px] leading-[1.45] text-forest italic [&_p]:text-[22px] [&_p]:text-forest">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-line" />,
};

/** Renders an MDX string with the site's typography plus any extra components. */
export function Prose({ source, components }: { source: string; components?: MDXComponents }) {
  return (
    <div className="max-w-[720px]">
      <MDXRemote source={source} components={{ ...base, ...components }} />
    </div>
  );
}
