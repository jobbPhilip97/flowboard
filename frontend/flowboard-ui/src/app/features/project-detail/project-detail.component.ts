import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService, Task, TaskStatus, TaskPriority } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskCountPipe } from '../../shared/pipes/task-count.pipe';
import { MarkdownImportComponent } from '../../shared/components/markdown-import/markdown-import.component';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'BACKLOG', label: 'Backlog' },
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' }
];

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DragDropModule, TaskCountPipe, MarkdownImportComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);

  readonly columns = COLUMNS;
  readonly connectedLists = COLUMNS.map(c => c.id);
  readonly tasks = this.taskService.tasks;
  readonly projects = this.projectService.projects;

  readonly projectId = signal(0);
  readonly project = computed(() =>
    this.projects().find(p => p.id === this.projectId())
  );

  readonly showForm = signal(false);
  readonly showImport = signal(false);
  readonly activeColumn = signal<TaskStatus>('TODO');

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)],
    priority: ['MEDIUM' as TaskPriority, Validators.required],
    dueDate: ['']
  });

  readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  tasksForColumn(status: TaskStatus): Task[] {
    return this.tasks().filter(t => t.status === status);
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projectId.set(id);
    this.projectService.loadAll().subscribe();
    this.taskService.loadByProject(id).subscribe();
  }

  openForm(status: TaskStatus) {
    this.activeColumn.set(status);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.form.reset({ priority: 'MEDIUM' });
  }

  submit() {
    if (this.form.invalid) return;
    const { title, description, priority, dueDate } = this.form.value;
    this.taskService.create(this.projectId(), {
      title: title!,
      description: description ?? undefined,
      status: this.activeColumn(),
      priority: (priority as TaskPriority) ?? 'MEDIUM',
      dueDate: dueDate || undefined,
      sortOrder: this.tasksForColumn(this.activeColumn()).length
    }).subscribe(() => this.closeForm());
  }

  drop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.taskService.updateStatus(this.projectId(), task.id, targetStatus).subscribe();
    }
  }

  deleteTask(task: Task) {
    this.taskService.delete(this.projectId(), task.id).subscribe();
  }

  onImported() {
    this.showImport.set(false);
    this.taskService.loadByProject(this.projectId()).subscribe();
  }

  priorityClass(priority: TaskPriority): string {
    return {
      LOW: 'badge-low',
      MEDIUM: 'badge-medium',
      HIGH: 'badge-high'
    }[priority];
  }
}
