package com.allonsy.service.impl;

import com.allonsy.dto.request.DeliveryRequest;
import com.allonsy.dto.request.RatingRequest;
import com.allonsy.dto.response.DeliveryResponse;
import com.allonsy.entity.*;
import com.allonsy.exception.BadRequestException;
import com.allonsy.exception.ResourceNotFoundException;
import com.allonsy.repository.DeliveryRepository;
import com.allonsy.repository.UserRepository;
import com.allonsy.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;

    // Pricing: base fee + points config
    private static final double BASE_PRICE = 3.0;
    private static final double DELIVERER_CUT = 0.75; // 75% of price goes to deliverer
    private static final int POINTS_PER_DELIVERY = 10;
    private static final int RECENT_MONTHS_WINDOW = 3;

    @Override
    public DeliveryResponse createDelivery(DeliveryRequest request, String email) {
        User sender = getUserByEmail(email);
        double price = calculatePrice(request);
        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Delivery delivery = Delivery.builder()
                .sender(sender)
                .pickupAddress(request.getPickupAddress())
                .deliveryAddress(request.getDeliveryAddress())
                .itemDescription(request.getItemDescription())
                .itemCategory(request.getItemCategory())
                .status(DeliveryStatus.PENDING)
                .estimatedPrice(price)
                .delivererEarning(Math.round(price * DELIVERER_CUT * 100.0) / 100.0)
                .pointsAwarded(POINTS_PER_DELIVERY)
                .confirmationCode(code)
                .build();

        return toResponse(deliveryRepository.save(delivery));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryResponse> getAvailableDeliveries() {
        return deliveryRepository.findByStatusAndCreatedAtAfterOrderByCreatedAtDesc(
                DeliveryStatus.PENDING,
                getRecentThreshold())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryResponse> getMySentDeliveries(String email) {
        User user = getUserByEmail(email);
        return deliveryRepository.findBySenderAndCreatedAtAfterOrderByCreatedAtDesc(
                user,
                getRecentThreshold())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryResponse> getMyAcceptedDeliveries(String email) {
        User user = getUserByEmail(email);
        return deliveryRepository.findByDelivererAndCreatedAtAfterOrderByCreatedAtDesc(
                user,
                getRecentThreshold())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public DeliveryResponse acceptDelivery(Long deliveryId, String delivererEmail) {
        Delivery delivery = getDelivery(deliveryId);
        User deliverer = getUserByEmail(delivererEmail);

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new BadRequestException("This delivery is no longer available");
        }
        if (delivery.getSender().getEmail().equals(delivererEmail)) {
            throw new BadRequestException("You cannot deliver your own order");
        }

        delivery.setDeliverer(deliverer);
        delivery.setStatus(DeliveryStatus.ACCEPTED);
        return toResponse(deliveryRepository.save(delivery));
    }

    @Override
    public DeliveryResponse markAsDelivered(Long deliveryId, String delivererEmail) {
        Delivery delivery = getDelivery(deliveryId);
        validateDeliverer(delivery, delivererEmail);

        if (delivery.getStatus() != DeliveryStatus.ACCEPTED && delivery.getStatus() != DeliveryStatus.IN_PROGRESS) {
            throw new BadRequestException("Invalid delivery status");
        }
        delivery.setStatus(DeliveryStatus.DELIVERED);
        return toResponse(deliveryRepository.save(delivery));
    }

    @Override
    public DeliveryResponse confirmReceipt(Long deliveryId, String senderEmail, String code) {
        Delivery delivery = getDelivery(deliveryId);
        validateSender(delivery, senderEmail);

        if (delivery.getStatus() != DeliveryStatus.DELIVERED) {
            throw new BadRequestException("Delivery not marked as delivered yet");
        }
        if (!delivery.getConfirmationCode().equalsIgnoreCase(code)) {
            throw new BadRequestException("Invalid confirmation code");
        }

        delivery.setStatus(DeliveryStatus.CONFIRMED);
        // Release payment: add balance to deliverer
        User deliverer = delivery.getDeliverer();
        deliverer.setBalance(deliverer.getBalance() + delivery.getDelivererEarning());
        deliverer.setPoints(deliverer.getPoints() + delivery.getPointsAwarded());
        userRepository.save(deliverer);

        // Add points to sender too
        User sender = delivery.getSender();
        sender.setPoints(sender.getPoints() + POINTS_PER_DELIVERY / 2);
        userRepository.save(sender);

        delivery.setStatus(DeliveryStatus.COMPLETED);
        delivery.setCompletedAt(LocalDateTime.now());
        return toResponse(deliveryRepository.save(delivery));
    }

    @Override
    public DeliveryResponse rateDelivery(Long deliveryId, String senderEmail, RatingRequest request) {
        Delivery delivery = getDelivery(deliveryId);
        validateSender(delivery, senderEmail);

        if (delivery.getStatus() != DeliveryStatus.COMPLETED) {
            throw new BadRequestException("You can only rate a completed delivery");
        }
        if (delivery.getRating() != null) {
            throw new BadRequestException("You have already rated this delivery");
        }

        delivery.setRating(request.getRating());
        delivery.setRatingComment(request.getComment());

        // Update deliverer's average rating
        User deliverer = delivery.getDeliverer();
        int count = deliverer.getRatingCount() + 1;
        double newRating = ((deliverer.getRating() * deliverer.getRatingCount()) + request.getRating()) / count;
        deliverer.setRating(Math.round(newRating * 10.0) / 10.0);
        deliverer.setRatingCount(count);
        userRepository.save(deliverer);

        return toResponse(deliveryRepository.save(delivery));
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryById(Long id) {
        return toResponse(getDelivery(id));
    }

    @Override
    public DeliveryResponse switchRole(Long deliveryId, String email) {
        // This is a placeholder - role switching is on the user profile, not delivery-specific
        throw new BadRequestException("Use profile endpoint to switch role");
    }

    // ---- helpers ----

    private double calculatePrice(DeliveryRequest request) {
        // Simple pricing: base + category surcharge
        double price = BASE_PRICE;
        if (request.getItemCategory() == ItemCategory.PHARMACY ||
            request.getItemCategory() == ItemCategory.RESTAURANT) price += 2.0;
        else if (request.getItemCategory() == ItemCategory.PARCEL ||
                 request.getItemCategory() == ItemCategory.GROCERY) price += 1.5;
        return Math.round(price * 100.0) / 100.0;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Delivery getDelivery(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + id));
    }

    private LocalDateTime getRecentThreshold() {
        return LocalDateTime.now().minusMonths(RECENT_MONTHS_WINDOW);
    }

    private void validateDeliverer(Delivery delivery, String email) {
        if (delivery.getDeliverer() == null || !delivery.getDeliverer().getEmail().equals(email)) {
            throw new BadRequestException("You are not the deliverer of this order");
        }
    }

    private void validateSender(Delivery delivery, String email) {
        if (!delivery.getSender().getEmail().equals(email)) {
            throw new BadRequestException("You are not the sender of this order");
        }
    }

    private DeliveryResponse toResponse(Delivery d) {
        return DeliveryResponse.builder()
                .id(d.getId())
                .pickupAddress(d.getPickupAddress())
                .deliveryAddress(d.getDeliveryAddress())
                .itemDescription(d.getItemDescription())
                .itemCategory(d.getItemCategory())
                .status(d.getStatus())
                .estimatedPrice(d.getEstimatedPrice())
                .delivererEarning(d.getDelivererEarning())
                .pointsAwarded(d.getPointsAwarded())
                .confirmationCode(d.getConfirmationCode())
                .senderName(d.getSender().getFirstName() + " " + d.getSender().getLastName())
                .senderId(d.getSender().getId())
                .delivererName(d.getDeliverer() != null
                        ? d.getDeliverer().getFirstName() + " " + d.getDeliverer().getLastName() : null)
                .delivererId(d.getDeliverer() != null ? d.getDeliverer().getId() : null)
                .rating(d.getRating())
                .ratingComment(d.getRatingComment())
                .createdAt(d.getCreatedAt())
                .completedAt(d.getCompletedAt())
                .build();
    }
}
