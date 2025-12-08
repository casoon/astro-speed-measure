import type { AstroIntegration } from 'astro';
import type { SpeedMeasureOptions, TimingData, TimingEntry, TimingReport } from './types.js';
import { formatReport } from './output/console.js';
import { wrapIntegration } from './hooks/wrap-integrations.js';

const defaultOptions: SpeedMeasureOptions = {
  output: 'human',
  disable: false,
  measureIntegrations: true,
  measureVitePlugins: true,
  measurePages: true,
  verbose: false,
  thresholds: {
    green: 100,
    yellow: 1000,
  },
};

export function speedMeasure(userOptions: SpeedMeasureOptions = {}): AstroIntegration {
  const options = { ...defaultOptions, ...userOptions };
  
  const timings: TimingData = {
    entries: new Map(),
    startTime: 0,
  };

  if (options.disable) {
    return {
      name: 'astro-speed-measure',
      hooks: {},
    };
  }

  return {
    name: 'astro-speed-measure',
    hooks: {
      'astro:config:setup': ({ config, updateConfig, logger }) => {
        timings.startTime = performance.now();
        
        if (options.measureIntegrations) {
          const wrappedIntegrations = config.integrations
            .filter(i => i.name !== 'astro-speed-measure')
            .map(integration => wrapIntegration(integration, timings));
          
          updateConfig({
            integrations: wrappedIntegrations,
          });
        }
        
        logger.info('Speed measurement enabled');
      },
      
      'astro:build:done': ({ logger }) => {
        const totalTime = performance.now() - timings.startTime;
        
        const report: TimingReport = {
          totalBuildTime: totalTime,
          integrations: [],
          vitePlugins: [],
          pages: [],
        };
        
        timings.entries.forEach((entries, name) => {
          const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
          report.integrations.push({
            name,
            duration: totalDuration,
            count: entries.length,
          });
        });
        
        report.integrations.sort((a, b) => b.duration - a.duration);
        
        if (options.output === 'human') {
          formatReport(report, options, logger);
        } else if (options.output === 'json') {
          console.log(JSON.stringify(report, null, 2));
        } else if (typeof options.output === 'function') {
          options.output(report);
        }
      },
    },
  };
}

export default speedMeasure;
export type { SpeedMeasureOptions, TimingReport, TimingEntry } from './types.js';
