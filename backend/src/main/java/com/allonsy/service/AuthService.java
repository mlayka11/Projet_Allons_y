package com.allonsy.service;

import com.allonsy.dto.request.LoginRequest;
import com.allonsy.dto.request.RegisterRequest;
import com.allonsy.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
