export type Wash = "sage" | "sky" | "butter" | "blush" | "cream" | "mint";

/** Background classes for the pastel card washes. */
export const washBg: Record<Wash, string> = {
  sage: "bg-sage",
  sky: "bg-sky",
  butter: "bg-butter",
  blush: "bg-blush",
  cream: "bg-cream",
  mint: "bg-mint",
};

export const washCycle: Wash[] = ["sage", "sky", "butter", "blush", "cream", "mint"];
