package com.allonsy.controller;

import com.allonsy.dto.request.DeliveryRequest;
import com.allonsy.dto.request.RatingRequest;
import com.allonsy.dto.response.DeliveryResponse;
import com.allonsy.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<DeliveryResponse> create(
            @Valid @RequestBody DeliveryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.createDelivery(request, userDetails.getUsername()));
    }

    @GetMapping("/available")
    public ResponseEntity<List<DeliveryResponse>> getAvailable() {
        return ResponseEntity.ok(deliveryService.getAvailableDeliveries());
    }

    @GetMapping("/my/sent")
    public ResponseEntity<List<DeliveryResponse>> getMySent(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.getMySentDeliveries(userDetails.getUsername()));
    }

    @GetMapping("/my/accepted")
    public ResponseEntity<List<DeliveryResponse>> getMyAccepted(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.getMyAcceptedDeliveries(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.getDeliveryById(id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<DeliveryResponse> accept(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.acceptDelivery(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<DeliveryResponse> markDelivered(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.markAsDelivered(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<DeliveryResponse> confirm(
            @PathVariable Long id,
            @RequestParam String code,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.confirmReceipt(id, userDetails.getUsername(), code));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<DeliveryResponse> rate(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.rateDelivery(id, userDetails.getUsername(), request));
    }
}
