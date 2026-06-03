package com.flowboard.api.project;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository repo;

    public ProjectService(ProjectRepository repo) {
        this.repo = repo;
    }

    public List<ProjectDto> findAll() {
        return repo.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public ProjectDto findById(Long id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    public ProjectDto create(CreateProjectRequest request) {
        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        return toDto(repo.save(project));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }
        repo.deleteById(id);
    }

    private ProjectDto toDto(Project p) {
        return new ProjectDto(p.getId(), p.getName(), p.getDescription(), p.getCreatedAt());
    }
}
