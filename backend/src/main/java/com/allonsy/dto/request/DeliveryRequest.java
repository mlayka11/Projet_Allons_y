package com.allonsy.dto.request;

import com.allonsy.entity.ItemCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryRequest {
    @NotBlank
    private String pickupAddress;
    @NotBlank
    private String deliveryAddress;
    @NotBlank
    private String itemDescription;
    @NotNull
    private ItemCategory itemCategory;
}
