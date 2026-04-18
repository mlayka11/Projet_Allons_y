package com.allonsy.dto.request;

import com.allonsy.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @Email @NotBlank
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
    private String phone;
    private UserRole role = UserRole.SENDER;
}
