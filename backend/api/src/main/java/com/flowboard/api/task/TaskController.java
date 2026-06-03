package com.flowboard.api.task;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaskDto> getByProject(@PathVariable Long projectId) {
        return service.findByProject(projectId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskDto create(@PathVariable Long projectId, @Valid @RequestBody CreateTaskRequest request) {
        return service.create(projectId, request);
    }

    @PatchMapping("/{taskId}/status")
    public TaskDto updateStatus(@PathVariable Long projectId,
                                @PathVariable Long taskId,
                                @Valid @RequestBody UpdateTaskStatusRequest request) {
        return service.updateStatus(taskId, request);
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long projectId, @PathVariable Long taskId) {
        service.delete(taskId);
    }
}
