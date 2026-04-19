// src/app/core/models/delivery.model.ts
export type DeliveryStatus =
  | 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS'
  | 'DELIVERED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type ItemCategory =
  | 'FLOWER' | 'DOCUMENT' | 'PARCEL' | 'CAKE' | 'GROCERY'
  | 'GIFT' | 'KEY' | 'PERSONAL_ITEM' | 'BAKERY' | 'SUPERMARKET'
  | 'PHARMACY' | 'RESTAURANT' | 'BEAUTY_PERSONAL_CARE' | 'PET_BABY_STORE' | 'OTHER';

export interface Delivery {
  id: number;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  itemCategory: ItemCategory;
  status: DeliveryStatus;
  estimatedPrice: number;
  delivererEarning: number;
  pointsAwarded: number;
  confirmationCode?: string;
  senderName: string;
  senderId: number;
  delivererName?: string;
  delivererId?: number;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DeliveryRequest {
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  itemCategory: ItemCategory;
}

export interface RatingRequest {
  rating: number;
  comment?: string;
}
