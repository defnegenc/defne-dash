import type { Dependency } from "./types";
import { MODULES } from "./schema";

/**
 * The dependency graph: cross-entity relationships declared by every module,
 * composed into one list. Mechanisms follow the paper:
 *
 * - "update"   propagates a change automatically (executed at load time —
 *              see the todos loader computing Project.openCount).
 * - "validate" rejects a state that breaks a constraint (executed in the
 *              renderer, which flags violations instead of hiding them).
 *
 * §5.2.2 of the paper sandboxes execution in a UI state-management unit;
 * here dependencies are simple enough to run in loaders and widgets.
 */
export const DEPENDENCY_GRAPH: Dependency[] = MODULES.flatMap(
  (m) => m.dependencies ?? [],
);

/** Validate-mechanism check used by the badge widget. */
export function isStaleDate(date: unknown, today: string): boolean {
  return typeof date === "string" && date < today;
}
