package com.allonsy.service.impl;

import com.allonsy.dto.response.UserResponse;
import com.allonsy.entity.User;
import com.allonsy.entity.UserRole;
import com.allonsy.exception.ResourceNotFoundException;
import com.allonsy.repository.UserRepository;
import com.allonsy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        return toResponse(getUserByEmail(email));
    }

    @Override
    public UserResponse switchRole(String email, UserRole newRole) {
        User user = getUserByEmail(email);
        user.setRole(newRole);
        return toResponse(userRepository.save(user));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .rating(user.getRating())
                .ratingCount(user.getRatingCount())
                .points(user.getPoints())
                .balance(user.getBalance())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
