package com.DAMUnitedFC.backend_tfg.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. Mapeamos la URL que usa el AdminController (/api/uploads/...)
        registry.addResourceHandler("/api/uploads/**")
                // 2. Apuntamos a la carpeta REAL donde vimos las fotos (target/uploads)
                .addResourceLocations("file:./target/uploads/");
    }
}