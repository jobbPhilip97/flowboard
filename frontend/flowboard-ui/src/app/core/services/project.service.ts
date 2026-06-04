import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/projects';

  readonly projects = signal<Project[]>([]);

  loadAll() {
    return this.http.get<Project[]>(this.baseUrl).pipe(
      tap(data => this.projects.set(data))
    );
  }

  create(request: CreateProjectRequest) {
    return this.http.post<Project>(this.baseUrl, request).pipe(
      tap(() => this.loadAll().subscribe())
    );
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.projects.update(list => list.filter(p => p.id !== id)))
    );
  }
}
