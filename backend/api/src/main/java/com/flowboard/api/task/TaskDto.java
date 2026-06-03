package com.flowboard.api.task;

import com.flowboard.api.project.ProjectDto;

import java.time.LocalDate;

public record TaskDto(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        int sortOrder,
        Long projectId
) {}
