import { Component, inject } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private api = inject(ApiService);

  constructor() {
    this.api.loadProjects();
  }

  get projects() {
    return this.api.projects;
  }

  addProject() {
    this.api.createProject('New Project');
  }
}