package com.allonsy.service;

import com.allonsy.dto.request.DeliveryRequest;
import com.allonsy.dto.request.RatingRequest;
import com.allonsy.dto.response.DeliveryResponse;

import java.util.List;

public interface DeliveryService {
    DeliveryResponse createDelivery(DeliveryRequest request, String email);
    List<DeliveryResponse> getAvailableDeliveries();
    List<DeliveryResponse> getMySentDeliveries(String email);
    List<DeliveryResponse> getMyAcceptedDeliveries(String email);
    DeliveryResponse acceptDelivery(Long deliveryId, String delivererEmail);
    DeliveryResponse markAsDelivered(Long deliveryId, String delivererEmail);
    DeliveryResponse confirmReceipt(Long deliveryId, String senderEmail, String code);
    DeliveryResponse rateDelivery(Long deliveryId, String senderEmail, RatingRequest request);
    DeliveryResponse getDeliveryById(Long id);
    DeliveryResponse switchRole(Long deliveryId, String email);
}
