import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);

  readonly health = signal<string | null>(null);

  loadHealth() {
    this.http.get('http://localhost:8080/api/health', { responseType: 'text' })
      .subscribe(value => {
        this.health.set(value);
      });
  }
}