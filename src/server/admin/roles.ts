/**
 * Admin roles and what each may do. The single source of truth for permissions:
 * pages, server actions and the sidebar all ask `can(role, permission)`.
 */

export const ROLES = ["super_admin", "admin", "editor", "author", "support"] as const;
export type Role = (typeof ROLES)[number];

/** Roles the Super Admin can give to other people (there is only one Super Admin). */
export const ASSIGNABLE_ROLES: Exclude<Role, "super_admin">[] = ["admin", "editor", "author", "support"];

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  author: "Author",
  support: "Support",
};

export const ROLE_SUMMARY: Record<Role, string> = {
  super_admin: "Everything, including users, roles, ads, analytics, the activity log and undo.",
  admin: "Publishes and edits all articles and case studies, manages enquiries and contact settings, and sees analytics.",
  editor: "Writes and edits articles and case studies as drafts and submits them for review, and sees analytics.",
  author: "Writes, publishes, edits and hides their own blog posts.",
  support: "Views and handles enquiries: status, notes and replies.",
};

export type Permission =
  | "dashboard.view"
  | "staff.manage"
  | "activity.view"
  | "activity.undo"
  | "settings.edit"
  | "settings.ads"
  | "articles.view"
  | "articles.edit_any"
  | "articles.publish_any"
  | "articles.edit_own"
  | "articles.publish_own"
  | "cases.view"
  | "cases.edit"
  | "cases.publish"
  | "content.review"
  | "enquiries.view"
  | "enquiries.manage"
  | "enquiries.delete"
  | "analytics.view";

const MATRIX: Record<Role, Permission[]> = {
  super_admin: [
    "dashboard.view",
    "staff.manage",
    "activity.view",
    "activity.undo",
    "settings.edit",
    "settings.ads",
    "articles.view",
    "articles.edit_any",
    "articles.publish_any",
    "articles.edit_own",
    "articles.publish_own",
    "cases.view",
    "cases.edit",
    "cases.publish",
    "content.review",
    "enquiries.view",
    "enquiries.manage",
    "enquiries.delete",
    "analytics.view",
  ],
  admin: [
    "dashboard.view",
    "activity.view",
    "settings.edit",
    "articles.view",
    "articles.edit_any",
    "articles.publish_any",
    "articles.edit_own",
    "articles.publish_own",
    "cases.view",
    "cases.edit",
    "cases.publish",
    "content.review",
    "enquiries.view",
    "enquiries.manage",
    "analytics.view",
  ],
  editor: ["dashboard.view", "analytics.view", "articles.view", "articles.edit_any", "articles.edit_own", "cases.view", "cases.edit"],
  author: ["dashboard.view", "articles.view", "articles.edit_own", "articles.publish_own"],
  support: ["dashboard.view", "enquiries.view", "enquiries.manage"],
};

export function can(role: Role, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}
