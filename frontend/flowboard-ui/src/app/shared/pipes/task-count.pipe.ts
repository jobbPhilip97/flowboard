import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskStatus } from '../../core/services/task.service';

@Pipe({ name: 'taskCount', standalone: true })
export class TaskCountPipe implements PipeTransform {
  transform(tasks: Task[], status: TaskStatus): number {
    return tasks.filter(t => t.status === status).length;
  }
}
