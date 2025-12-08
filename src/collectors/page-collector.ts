import type { IntegrationResolvedRoute } from "astro";
import path from "node:path";
import type {
  PageInfo,
  PageRenderType,
  PageTiming,
  TimingSample,
} from "../types.js";
import { normalizeId } from "../utils/paths.js";

export class PageCollector {
  private pages = new Map<string, PageInfo>();
  private root: string = process.cwd();

  setRoot(root: string): void {
    this.root = root;
  }

  setRoutes(routes: IntegrationResolvedRoute[]): void {
    for (const route of routes) {
      const component = normalizeId(route.entrypoint, this.root);
      const renderType = resolveRenderType(route.isPrerendered, route.type);
      this.pages.set(component, {
        component,
        pathname: route.pathname ?? route.pattern ?? component,
        renderType,
      });
    }
  }

  setPagesFromBuild(pages: Map<string, any>): void {
    pages.forEach((page) => {
      const component = normalizeId(page.component, this.root);
      if (this.pages.has(component)) return;
      const renderType = resolveRenderType(
        (page.route as any).prerender ?? false,
        page.route.type,
      );
      this.pages.set(component, {
        component,
        pathname:
          page.route.route ??
          page.route.pattern ??
          page.route.pathname ??
          page.route.component,
        renderType,
      });
    });
  }

  buildReport(samples: TimingSample[]): PageTiming[] {
    const pageDurations = new Map<string, number>();

    for (const sample of samples) {
      const id =
        typeof sample.meta?.id === "string"
          ? normalizeId(sample.meta.id as string, this.root)
          : undefined;
      if (!id) continue;
      const match = this.findPageForId(id);
      if (!match) continue;
      const current = pageDurations.get(match.component) ?? 0;
      pageDurations.set(match.component, current + sample.duration);
    }

    for (const [component] of this.pages) {
      if (!pageDurations.has(component)) {
        pageDurations.set(component, 0);
      }
    }

    const results: PageTiming[] = [];
    for (const [component, duration] of pageDurations) {
      const info = this.pages.get(component);
      if (!info) continue;
      results.push({
        component: path.normalize(info.component),
        pathname: info.pathname,
        type: info.renderType,
        duration,
      });
    }

    results.sort((a, b) => b.duration - a.duration);
    return results;
  }

  private findPageForId(id: string): PageInfo | undefined {
    if (this.pages.has(id)) return this.pages.get(id);
    for (const [component, info] of this.pages) {
      if (id === component) return info;
      if (id.startsWith(component)) return info;
    }
    return undefined;
  }
}

function resolveRenderType(
  isPrerendered: boolean | undefined,
  routeType: string | undefined,
): PageRenderType {
  if (routeType === "endpoint") return "api";
  if (isPrerendered === true) return "ssg";
  if (isPrerendered === false) return "ssr";
  return "unknown";
}
