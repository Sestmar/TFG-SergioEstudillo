package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.Usuario;

public interface NotificationProvider {
    void sendNotification(Usuario usuario, String title, String body);
}
