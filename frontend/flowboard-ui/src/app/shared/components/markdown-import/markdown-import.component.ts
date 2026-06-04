import {
  Component, EventEmitter, Input, Output, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { concatMap, from, toArray } from 'rxjs';
import { MarkdownParserService, ParsedPhase, ParsedTask } from '../../../core/services/markdown-parser.service';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-markdown-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './markdown-import.component.html',
  styleUrl: './markdown-import.component.css'
})
export class MarkdownImportComponent {
  @Input({ required: true }) projectId!: number;
  @Output() imported = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private parser = inject(MarkdownParserService);
  private taskService = inject(TaskService);

  readonly phases = signal<ParsedPhase[]>([]);
  readonly isDragging = signal(false);
  readonly showGuide = signal(false);
  readonly importing = signal(false);
  readonly fileName = signal('');
  readonly error = signal('');

  readonly totalSelected = computed(() =>
    this.phases().flatMap(p => p.tasks).filter(t => t.selected).length
  );

  readonly hasPhases = computed(() => this.phases().length > 0);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.readFile(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.readFile(file);
  }

  private readFile(file: File) {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      this.error.set('Only .md or .txt files are supported.');
      return;
    }
    this.error.set('');
    this.fileName.set(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const phases = this.parser.parse(content);
      if (phases.length === 0) {
        this.error.set('No phases or tasks found. Make sure the file uses ## or ### headings with numbered lists below them.');
      }
      this.phases.set(phases);
    };
    reader.readAsText(file);
  }

  toggleTask(phase: ParsedPhase, task: ParsedTask) {
    this.phases.update(phases =>
      phases.map(p =>
        p === phase
          ? { ...p, tasks: p.tasks.map(t => t === task ? { ...t, selected: !t.selected } : t) }
          : p
      )
    );
  }

  togglePhase(phase: ParsedPhase) {
    const allSelected = phase.tasks.every(t => t.selected);
    this.phases.update(phases =>
      phases.map(p =>
        p === phase
          ? { ...p, tasks: p.tasks.map(t => ({ ...t, selected: !allSelected })) }
          : p
      )
    );
  }

  isPhaseAllSelected(phase: ParsedPhase): boolean {
    return phase.tasks.every(t => t.selected);
  }

  isPhasePartiallySelected(phase: ParsedPhase): boolean {
    const count = phase.tasks.filter(t => t.selected).length;
    return count > 0 && count < phase.tasks.length;
  }

  importTasks() {
    const selected = this.phases()
      .flatMap(p => p.tasks)
      .filter(t => t.selected);

    if (selected.length === 0) return;

    this.importing.set(true);

    from(selected).pipe(
      concatMap((task, index) =>
        this.taskService.create(this.projectId, {
          title: task.title,
          description: `Phase: ${task.phase}`,
          status: 'BACKLOG',
          priority: 'MEDIUM',
          sortOrder: index
        })
      ),
      toArray()
    ).subscribe({
      next: () => {
        this.importing.set(false);
        this.imported.emit();
      },
      error: () => {
        this.importing.set(false);
        this.error.set('Something went wrong while importing tasks. Please try again.');
      }
    });
  }
}
