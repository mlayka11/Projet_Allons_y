package com.allonsy.entity;

public enum DeliveryStatus {
    PENDING,      // posted, waiting for a deliverer
    ACCEPTED,     // deliverer accepted
    IN_PROGRESS,  // on the way
    DELIVERED,    // delivered, waiting for confirmation
    CONFIRMED,    // sender confirmed with code
    COMPLETED,    // payment released, mission done
    CANCELLED
}
