package com.allonsy.dto.response;

import com.allonsy.entity.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private UserRole role;
    private Double rating;
    private Integer ratingCount;
    private Integer points;
    private Double balance;
    private LocalDateTime createdAt;
}
