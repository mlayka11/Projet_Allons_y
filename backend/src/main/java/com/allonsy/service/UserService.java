package com.allonsy.service;

import com.allonsy.dto.response.UserResponse;
import com.allonsy.entity.UserRole;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse switchRole(String email, UserRole newRole);
}
