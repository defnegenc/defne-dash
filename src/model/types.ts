/**
 * Jelly vocabulary (Cao, Jiang & Xia, CHI '25 — arXiv:2503.04084).
 *
 * The task-driven data model is an object-relational schema: a root task
 * object, entities, and typed attributes. Attributes come in exactly four
 * kinds; each attribute carries a UI annotation <function, render, editable>
 * that the ui-spec layer turns into widgets.
 */

export type AttributeKind = "SVAL" | "DICT" | "ARRY" | "PNTR";

/** Widget render types the rule-based renderer knows how to map. */
export type RenderType =
  | "text"
  | "time"
  | "link"
  | "badge"
  | "stat"
  | "list"
  | "feed"
  | "pr-pile";

export interface UiAnnotation {
  /** Functional role of the attribute in the interface. */
  function: "display" | "navigation" | "status";
  /** SVALs take a widget render type; ARRYs are "expanded" or "summary". */
  render: RenderType | "expanded" | "summary";
  editable: boolean;
  /** PNTR / ARRY-of-PNTR only: attributes of the target shown minimized. */
  thumbnail?: string[];
  /** Shown only when the tile is expanded (dragged bigger). */
  detail?: boolean;
}

export interface AttributeDef {
  key: string;
  label: string;
  kind: AttributeKind;
  /** PNTR, or ARRY of PNTR: name of the referred entity. */
  entity?: string;
  ui: UiAnnotation;
}

export interface EntityDef {
  name: string;
  title: string;
  attributes: AttributeDef[];
}

/** Instantiated attribute values for one entity (the paper's Structured Data). */
export type StructuredData = Record<string, unknown>;

/**
 * Dependency := { Source, Target, Mechanism, Relationship }.
 * Declared data; execution lives behind `runDependency` in model/dependencies.ts.
 */
export interface Dependency {
  source: string; // "Entity.attr"
  target: string; // "Entity.attr"
  mechanism: "validate" | "update";
  relationship: string;
}

/** A dashboard module = one schema fragment + its data loader. */
export interface DashboardModule {
  id: string;
  entity: EntityDef;
  load: () => Promise<StructuredData>;
  dependencies?: Dependency[];
}
