package com.DAMUnitedFC.backend_tfg.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Obtenemos la ruta absoluta del proyecto
        String projectDir = System.getProperty("user.dir");
        // Construimos la ruta hacia target/uploads de forma segura para Windows
        String uploadPath = Paths.get(projectDir, "target", "uploads").toUri().toString();

        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(uploadPath);
    }
}