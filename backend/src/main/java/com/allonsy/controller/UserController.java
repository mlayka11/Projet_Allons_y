package com.allonsy.controller;

import com.allonsy.dto.response.UserResponse;
import com.allonsy.entity.UserRole;
import com.allonsy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @PatchMapping("/me/role")
    public ResponseEntity<UserResponse> switchRole(
            @RequestParam UserRole role,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.switchRole(userDetails.getUsername(), role));
    }
}
