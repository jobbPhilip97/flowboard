package com.flowboard.api;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class HealthController {

    @GetMapping("/health")
    public String health() {
        return "FlowBoard API is running 🚀";
    }
}