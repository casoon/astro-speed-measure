# Konzept: Speed Measure Astro Plugin

## Übersicht

Ein Astro.js-Plugin, das Build-Performance-Metriken erfasst und analysiert - inspiriert vom `speed-measure-webpack-plugin`.

## Ziel

Entwicklern helfen, Performance-Bottlenecks im Astro-Build-Prozess zu identifizieren durch detaillierte Zeitmessungen von:
- Integrations (Astro-Plugins)
- Vite-Plugins
- Content Collections
- Page/Route-Generierung
- Asset-Verarbeitung

---

## Hauptfunktionen

### 1. Integration-Timing
- Zeitmessung für alle Astro-Integrations
- Aufschlüsselung nach Hooks:
  - `astro:config:setup`
  - `astro:config:done`
  - `astro:server:setup`
  - `astro:server:start`
  - `astro:server:done`
  - `astro:build:start`
  - `astro:build:setup`
  - `astro:build:generated`
  - `astro:build:ssr`
  - `astro:build:done`

### 2. Vite-Plugin-Timing
- Zeitmessung für Vite-Plugins (Astro nutzt Vite unter der Haube)
- Transform-Zeiten pro Plugin
- Resolve-Zeiten

### 3. Content Collections
- Zeit für Collection-Parsing
- Zeit pro Collection
- Schema-Validierung-Dauer

### 4. Seiten-/Routen-Generierung
- Zeit pro generierter Seite
- SSG vs SSR Unterscheidung
- Slowest Pages Ranking

### 5. Asset-Verarbeitung
- Bild-Optimierung-Zeiten
- CSS/JS-Bundling-Zeiten
- Font-Verarbeitung

---

## Technische Umsetzung

### Projektstruktur

```
astro-speed-measure/
├── src/
│   ├── index.ts              # Haupt-Export & Integration
│   ├── integration.ts        # Astro Integration Wrapper
│   ├── vite-plugin.ts        # Vite Plugin für Transform-Timing
│   ├── hooks/
│   │   ├── wrap-integrations.ts   # Integration-Wrapping-Logik
│   │   └── timing-hooks.ts        # Hook-Timing-Erfassung
│   ├── collectors/
│   │   ├── page-collector.ts      # Seiten-Build-Zeiten
│   │   ├── asset-collector.ts     # Asset-Verarbeitung
│   │   └── content-collector.ts   # Content Collections
│   ├── output/
│   │   ├── console.ts        # Konsolenausgabe
│   │   ├── json.ts           # JSON-Export
│   │   └── html-report.ts    # HTML-Report-Generator
│   └── utils/
│       ├── timing.ts         # Zeitmess-Utilities
│       └── stats.ts          # Statistische Berechnungen
├── package.json
├── tsconfig.json
└── README.md
```

### API-Design

```typescript
// Nutzung in astro.config.mjs
import { defineConfig } from 'astro/config';
import speedMeasure from 'astro-speed-measure';

export default defineConfig({
  integrations: [
    speedMeasure({
      // Optionen
      output: 'human', // 'human' | 'json' | 'html' | Function
      outputFile: './build-metrics.json',
      disable: process.env.DISABLE_SPEED_MEASURE === 'true',
      
      // Was gemessen werden soll
      measureIntegrations: true,
      measureVitePlugins: true,
      measurePages: true,
      measureAssets: true,
      measureContentCollections: true,
      
      // Detailgrad
      topPages: 10,        // Top 10 langsamste Seiten
      topAssets: 10,       // Top 10 langsamste Assets
      verbose: false,      // Erweiterte Statistiken
      
      // Thresholds für Farbcodierung (ms)
      thresholds: {
        green: 100,
        yellow: 1000,
        // Alles darüber = rot
      }
    }),
    
    // Andere Integrations werden automatisch gemessen
    react(),
    tailwind(),
    mdx(),
  ]
});
```

### Integration-Wrapping

```typescript
// integration.ts
import type { AstroIntegration } from 'astro';

export function createSpeedMeasureIntegration(options: Options): AstroIntegration {
  const timings = new Map<string, TimingData>();
  
  return {
    name: 'astro-speed-measure',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        // Alle anderen Integrations wrappen
        const wrappedIntegrations = config.integrations.map(integration => 
          wrapIntegration(integration, timings)
        );
        
        // Vite-Plugin für Transform-Timing hinzufügen
        updateConfig({
          integrations: wrappedIntegrations,
          vite: {
            plugins: [createTimingVitePlugin(timings)]
          }
        });
      },
      
      'astro:build:done': ({ dir, pages }) => {
        // Finale Ausgabe generieren
        outputResults(timings, options);
      }
    }
  };
}

function wrapIntegration(
  integration: AstroIntegration, 
  timings: Map<string, TimingData>
): AstroIntegration {
  const wrappedHooks = {};
  
  for (const [hookName, hookFn] of Object.entries(integration.hooks || {})) {
    wrappedHooks[hookName] = async (...args) => {
      const start = performance.now();
      try {
        return await hookFn(...args);
      } finally {
        const duration = performance.now() - start;
        recordTiming(timings, integration.name, hookName, duration);
      }
    };
  }
  
  return {
    ...integration,
    hooks: wrappedHooks
  };
}
```

### Vite-Plugin für Transform-Timing

```typescript
// vite-plugin.ts
import type { Plugin } from 'vite';

export function createTimingVitePlugin(timings: Map<string, TimingData>): Plugin {
  return {
    name: 'astro-speed-measure-vite',
    enforce: 'pre',
    
    configResolved(config) {
      // Andere Vite-Plugins wrappen
      config.plugins.forEach(plugin => {
        if (plugin.transform) {
          const originalTransform = plugin.transform;
          plugin.transform = async function(code, id, options) {
            const start = performance.now();
            const result = await originalTransform.call(this, code, id, options);
            const duration = performance.now() - start;
            recordVitePluginTiming(timings, plugin.name, 'transform', id, duration);
            return result;
          };
        }
      });
    }
  };
}
```

### Ausgabe-Beispiel

```
╔══════════════════════════════════════════════════════════════╗
║  ASTRO SPEED MEASURE - Build Performance Report              ║
╠══════════════════════════════════════════════════════════════╣
║  Total Build Time: 12.45s                                    ║
╚══════════════════════════════════════════════════════════════╝

INTEGRATIONS
────────────────────────────────────────────────────────────────
  @astrojs/react          1.23s  ████████░░░░░░░░░░░░  10%
    └─ astro:config:setup   1.20s
    └─ astro:build:done     0.03s
    
  @astrojs/tailwind       0.89s  ██████░░░░░░░░░░░░░░   7%
    └─ astro:config:setup   0.45s
    └─ astro:build:setup    0.44s
    
  @astrojs/mdx            2.34s  ████████████████░░░░  19%
    └─ astro:config:setup   0.12s
    └─ astro:build:done     2.22s

VITE PLUGINS
────────────────────────────────────────────────────────────────
  vite:css                3.21s  ██████████████████░░  26%
  vite:esbuild            1.87s  ███████████░░░░░░░░░  15%
  astro:jsx               0.92s  █████░░░░░░░░░░░░░░░   7%

PAGES (Top 10 Slowest)
────────────────────────────────────────────────────────────────
  /blog/[...slug]         2.34s  (45 pages)
  /docs/[...path]         1.89s  (123 pages)
  /products/[id]          0.67s  (89 pages)

CONTENT COLLECTIONS
────────────────────────────────────────────────────────────────
  blog                    1.23s  (45 entries)
  docs                    0.89s  (123 entries)
  
ASSETS
────────────────────────────────────────────────────────────────
  Image Optimization      3.45s  (234 images)
  CSS Bundling           0.78s
  JS Bundling            1.23s
```

---

## Implementierungs-Roadmap

### Phase 1: Grundgerüst
- [ ] Projekt-Setup mit TypeScript
- [ ] Basis-Integration erstellen
- [ ] Integration-Wrapping implementieren
- [ ] Einfache Konsolenausgabe

### Phase 2: Erweiterte Messungen
- [ ] Vite-Plugin-Timing
- [ ] Seiten-Generierung-Timing
- [ ] Content-Collection-Timing

### Phase 3: Ausgabe-Formate
- [ ] JSON-Export
- [ ] HTML-Report
- [ ] Statistiken (Median, Durchschnitt, etc.)

### Phase 4: Extras
- [ ] Build-Vergleich über Zeit
- [ ] CI/CD-Integration (GitHub Actions Output)
- [ ] Performance-Budgets mit Warnungen

---

## Technische Herausforderungen

### 1. Astro-Interna
- Astro's Build-Prozess ist teilweise intern
- Manche Metriken müssen indirekt erfasst werden
- Vite-Plugin-Order ist wichtig

### 2. Async-Timing
- Viele Operationen sind async/parallel
- Überlappende Zeiten müssen korrekt behandelt werden
- Worker-Threads bei Bild-Optimierung

### 3. Dev-Server vs Build
- Unterschiedliche Hooks für Dev und Build
- Dev-Server hat HMR-spezifische Messungen
- Build hat SSG/SSR-spezifische Messungen

---

## Abhängigkeiten

```json
{
  "name": "astro-speed-measure",
  "version": "0.1.0",
  "peerDependencies": {
    "astro": "^4.0.0 || ^5.0.0"
  },
  "dependencies": {
    "picocolors": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## Referenzen

- [Astro Integration API](https://docs.astro.build/en/reference/integrations-reference/)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin)

---

## Nächste Schritte für Claude

1. Projekt-Grundgerüst erstellen
2. TypeScript-Konfiguration
3. Basis-Integration mit Hook-Wrapping
4. Erste Konsolenausgabe testen
5. Iterativ erweitern
