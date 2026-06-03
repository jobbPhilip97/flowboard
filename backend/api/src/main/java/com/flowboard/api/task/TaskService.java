package com.flowboard.api.task;

import com.flowboard.api.project.ProjectRepository;
import com.flowboard.api.project.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;

    public TaskService(TaskRepository taskRepo, ProjectRepository projectRepo) {
        this.taskRepo = taskRepo;
        this.projectRepo = projectRepo;
    }

    public List<TaskDto> findByProject(Long projectId) {
        if (!projectRepo.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
        return taskRepo.findByProjectIdOrderBySortOrder(projectId).stream()
                .map(this::toDto)
                .toList();
    }

    public TaskDto create(Long projectId, CreateTaskRequest request) {
        var project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status() != null ? request.status() : TaskStatus.BACKLOG);
        task.setPriority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM);
        task.setDueDate(request.dueDate());
        task.setSortOrder(request.sortOrder());
        task.setProject(project);

        return toDto(taskRepo.save(task));
    }

    public TaskDto updateStatus(Long taskId, UpdateTaskStatusRequest request) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        task.setStatus(request.status());
        return toDto(taskRepo.save(task));
    }

    public void delete(Long taskId) {
        if (!taskRepo.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found with id: " + taskId);
        }
        taskRepo.deleteById(taskId);
    }

    private TaskDto toDto(Task t) {
        return new TaskDto(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getStatus(),
                t.getPriority(),
                t.getDueDate(),
                t.getSortOrder(),
                t.getProject().getId()
        );
    }
}
