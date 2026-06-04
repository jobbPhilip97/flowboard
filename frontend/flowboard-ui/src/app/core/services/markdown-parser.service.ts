import { Injectable } from '@angular/core';

export interface ParsedTask {
  title: string;
  phase: string;
  selected: boolean;
}

export interface ParsedPhase {
  name: string;
  tasks: ParsedTask[];
}

@Injectable({ providedIn: 'root' })
export class MarkdownParserService {
  /**
   * Parses a markdown string and extracts phases (### headings)
   * with their numbered list items as tasks.
   *
   * Supports structures like:
   *   ### Fas 1 – Some title
   *   1. Do something
   *   2. Do something else
   */
  parse(markdown: string): ParsedPhase[] {
    const phases: ParsedPhase[] = [];
    const lines = markdown.split('\n');

    let currentPhase: ParsedPhase | null = null;

    for (const raw of lines) {
      const line = raw.trim();

      // Match ### headings (phase headers)
      const headingMatch = line.match(/^#{2,4}\s+(.+)/);
      if (headingMatch) {
        currentPhase = { name: headingMatch[1].trim(), tasks: [] };
        phases.push(currentPhase);
        continue;
      }

      // Match numbered list items: "1. Some task" or "- Some task"
      const listMatch = line.match(/^(?:\d+\.|[-*])\s+(.+)/);
      if (listMatch && currentPhase) {
        const title = listMatch[1].trim();
        if (title.length > 0) {
          currentPhase.tasks.push({
            title,
            phase: currentPhase.name,
            selected: true
          });
        }
      }
    }

    // Only return phases that have at least one task
    return phases.filter(p => p.tasks.length > 0);
  }
}
