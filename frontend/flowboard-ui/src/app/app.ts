import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private api = inject(ApiService);

  protected readonly title = 'flowboard-ui';

  constructor() {
    this.api.loadHealth();
  }

  get health() {
    return this.api.health;
  }
}