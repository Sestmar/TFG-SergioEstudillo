package com.DAMUnitedFC.backend_tfg;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class BackendTfgApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendTfgApplication.class, args);
	}

}
