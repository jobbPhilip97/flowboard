import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  sortOrder: number;
  projectId: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  sortOrder?: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  readonly tasks = signal<Task[]>([]);

  private url(projectId: number) {
    return `http://localhost:8080/api/projects/${projectId}/tasks`;
  }

  loadByProject(projectId: number) {
    return this.http.get<Task[]>(this.url(projectId)).pipe(
      tap(data => this.tasks.set(data))
    );
  }

  create(projectId: number, request: CreateTaskRequest) {
    return this.http.post<Task>(this.url(projectId), request).pipe(
      tap(task => this.tasks.update(list => [...list, task]))
    );
  }

  updateStatus(projectId: number, taskId: number, status: TaskStatus) {
    return this.http
      .patch<Task>(`${this.url(projectId)}/${taskId}/status`, { status })
      .pipe(
        tap(updated =>
          this.tasks.update(list =>
            list.map(t => (t.id === updated.id ? updated : t))
          )
        )
      );
  }

  delete(projectId: number, taskId: number) {
    return this.http.delete<void>(`${this.url(projectId)}/${taskId}`).pipe(
      tap(() => this.tasks.update(list => list.filter(t => t.id !== taskId)))
    );
  }
}
