package com.allonsy.dto.response;

import com.allonsy.entity.DeliveryStatus;
import com.allonsy.entity.ItemCategory;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class DeliveryResponse {
    private Long id;
    private String pickupAddress;
    private String deliveryAddress;
    private String itemDescription;
    private ItemCategory itemCategory;
    private DeliveryStatus status;
    private Double estimatedPrice;
    private Double delivererEarning;
    private Integer pointsAwarded;
    private String confirmationCode;
    private String senderName;
    private Long senderId;
    private String delivererName;
    private Long delivererId;
    private Integer rating;
    private String ratingComment;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
