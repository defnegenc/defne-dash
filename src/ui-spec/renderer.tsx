import type { AttributeDef, DashboardModule, StructuredData } from "@/model/types";
import { GlassPanel } from "@/components/panel";
import {
  BadgeWidget,
  CollectionWidget,
  LinkWidget,
  PrPileWidget,
  StatWidget,
  TextWidget,
  TimeWidget,
} from "./widgets";

/**
 * The rule-based renderer (paper §5.2.3): walk the entity's attributes,
 * read each UI annotation, map it to a widget. No module-specific JSX
 * exists anywhere — panels fall out of schema + spec + data.
 */
export function renderAttribute(attr: AttributeDef, value: unknown, expanded = false) {
  if (attr.ui.detail && !expanded) return null;
  const { render, thumbnail = [] } = attr.ui;

  if (attr.kind === "ARRY") {
    if (render === "pr-pile") {
      return <PrPileWidget key={attr.key} label={attr.label} items={value} expanded={expanded} />;
    }
    const variant =
      attr.entity === "FeedItem" || attr.entity === "NewsItem"
        ? "feed"
        : render === "summary"
          ? "summary"
          : "list";
    return (
      <CollectionWidget
        key={attr.key}
        label={attr.label}
        items={value}
        thumbnail={thumbnail}
        variant={variant}
        expanded={expanded}
      />
    );
  }

  switch (render) {
    case "time":
      return <TimeWidget key={attr.key} label={attr.label} value={value} />;
    case "link":
      return <LinkWidget key={attr.key} label={attr.label} value={value} />;
    case "badge":
      return <BadgeWidget key={attr.key} label={attr.label} value={value} />;
    case "stat":
      return <StatWidget key={attr.key} label={attr.label} value={value} />;
    case "text":
    default:
      return <TextWidget key={attr.key} label={attr.label} value={value} />;
  }
}

export function ModulePanel({
  module,
  data,
  className,
  expanded = false,
}: {
  module: DashboardModule;
  data: StructuredData;
  className?: string;
  expanded?: boolean;
}) {
  return (
    <GlassPanel title={module.entity.title} className={className}>
      {module.entity.attributes.map((attr) => renderAttribute(attr, data[attr.key], expanded))}
    </GlassPanel>
  );
}
