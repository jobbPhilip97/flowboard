import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Project {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);

  readonly projects = signal<Project[]>([]);

  loadProjects() {
    this.http.get<Project[]>('http://localhost:8080/api/projects')
      .subscribe(data => this.projects.set(data));
  }

  createProject(name: string) {
    this.http.post<Project>('http://localhost:8080/api/projects', { name })
      .subscribe(() => this.loadProjects());
  }
}