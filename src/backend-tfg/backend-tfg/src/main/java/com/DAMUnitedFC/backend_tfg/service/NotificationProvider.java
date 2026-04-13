package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.Usuario;

import java.util.Map;

public interface NotificationProvider {
    void sendNotification(Usuario usuario, String title, String body);

    default void sendNotification(Usuario usuario, String title, String body, Map<String, String> data) {
        sendNotification(usuario, title, body);
    }
}
