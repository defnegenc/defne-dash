import type { DashboardModule } from "./types";
import { newsModule } from "@/modules/news";
import { prsModule } from "@/modules/prs";

/**
 * The task object: root of the object-relational schema.
 * News at the top, the PR pile as the long tile under it.
 */
export const TASK = {
  name: "personal-overview",
  title: "defne dash",
  panels: ["news", "prs"] as const,
};

export const MODULES: DashboardModule[] = [newsModule, prsModule];
