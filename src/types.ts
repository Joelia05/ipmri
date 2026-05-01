export type UserRole = 'admin' | 'manager' | 'staff';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  status: 'available' | 'low' | 'out_of_stock';
  sku?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: any;
  userId: string;
  userName?: string;
}

export interface ProductionLog {
  id: string;
  rawMaterials: { itemId: string; quantity: number }[];
  finishedGoods: { itemId: string; quantity: number }[];
  date: any;
  userId: string;
}
