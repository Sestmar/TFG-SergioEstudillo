package com.DAMUnitedFC.backend_tfg.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.config.path:classpath:serviceAccountKey.json}")
    private String firebaseConfigPath;

    @PostConstruct
    public void initialize() {
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("FirebaseApp ya inicializado — se omite reinicialización");
            return;
        }

        try {
            InputStream serviceAccount = resolveInputStream(firebaseConfigPath);
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK inicializado desde: {}", firebaseConfigPath);
        } catch (IOException e) {
            log.warn("No se pudo cargar la configuración de Firebase desde '{}' — FCM deshabilitado. " +
                     "En local: colocá serviceAccountKey.json en src/main/resources/. " +
                     "En Render: configurá el Secret File y la variable FIREBASE_CONFIG_PATH.",
                     firebaseConfigPath);
        }
    }

    /**
     * Resuelve el InputStream según el tipo de path:
     * - "classpath:nombre.json" → ClassPathResource (local, dentro del JAR)
     * - "/ruta/absoluta/archivo.json" → FileInputStream (Secret File en Render)
     */
    private InputStream resolveInputStream(String path) throws IOException {
        if (path.startsWith("classpath:")) {
            String resourceName = path.substring("classpath:".length());
            return new ClassPathResource(resourceName).getInputStream();
        }
        return new FileInputStream(path);
    }
}
