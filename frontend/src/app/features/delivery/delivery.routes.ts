// src/app/features/delivery/delivery.routes.ts
import { Routes } from '@angular/router';

export const deliveryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./delivery-list/delivery-list.component').then(m => m.DeliveryListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./delivery-create/delivery-create.component').then(m => m.DeliveryCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./delivery-detail/delivery-detail.component').then(m => m.DeliveryDetailComponent)
  }
];
