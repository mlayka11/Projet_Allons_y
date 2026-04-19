package com.allonsy.repository;

import com.allonsy.entity.Delivery;
import com.allonsy.entity.DeliveryStatus;
import com.allonsy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findBySender(User sender);
    List<Delivery> findByDeliverer(User deliverer);
    List<Delivery> findByStatus(DeliveryStatus status);
    List<Delivery> findBySenderOrderByCreatedAtDesc(User sender);
    List<Delivery> findByDelivererOrderByCreatedAtDesc(User deliverer);
    List<Delivery> findByStatusAndCreatedAtAfterOrderByCreatedAtDesc(DeliveryStatus status, java.time.LocalDateTime threshold);
    List<Delivery> findBySenderAndCreatedAtAfterOrderByCreatedAtDesc(User sender, java.time.LocalDateTime threshold);
    List<Delivery> findByDelivererAndCreatedAtAfterOrderByCreatedAtDesc(User deliverer, java.time.LocalDateTime threshold);
}
