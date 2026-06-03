package com.flowboard.api.project;

import java.time.LocalDateTime;

public record ProjectDto(
        Long id,
        String name,
        String description,
        LocalDateTime createdAt
) {}
