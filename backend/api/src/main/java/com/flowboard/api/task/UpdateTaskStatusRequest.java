package com.flowboard.api.task;

import jakarta.validation.constraints.NotNull;

public record UpdateTaskStatusRequest(
        @NotNull(message = "Status is required")
        TaskStatus status
) {}
