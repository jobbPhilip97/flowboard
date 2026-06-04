import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { LoadingService } from '../../core/services/loading.service';
import { HeroSceneComponent } from '../../three/hero-scene.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, HeroSceneComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']   
})
export class HomeComponent implements OnInit {
  private projectService = inject(ProjectService);
  readonly loadingService = inject(LoadingService);

  readonly projects = this.projectService.projects;
  readonly showForm = signal(false);

  private fb = inject(FormBuilder);
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)]
  });

  ngOnInit() {
    this.projectService.loadAll().subscribe();
  }

  openForm() { this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.form.reset(); }

  submit() {
    if (this.form.invalid) return;
    this.projectService.create({
      name: this.form.value.name!,
      description: this.form.value.description ?? undefined
    }).subscribe(() => this.closeForm());
  }

  deleteProject(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.projectService.delete(id).subscribe();
  }
}
