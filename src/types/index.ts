export type Role = 'SUPERADMIN' | 'ADMIN';

export interface PlanConfig {
  id: string;
  name: string;
  maxCategories: number;
  maxMenuItems: number;
  maxAdmins: number;
  price: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  restaurantId: string | null;
  restaurant: Restaurant | null;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  plan: string;
  createdAt: string;
  _count?: { categories: number; menuItems: number; users: number };
}

export interface Category {
  id: string;
  name: string;
  order: number;
  restaurantId: string;
  createdAt: string;
  _count?: { menuItems: number };
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  categoryId: string;
  restaurantId: string;
  category?: Category;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RestaurantWithMenu extends Restaurant {
  categories: (Category & { menuItems: MenuItem[] })[];
}

export interface RestaurantDetail extends Restaurant {
  categories: (Category & { _count: { menuItems: number } })[];
  users: { id: string; name: string; email: string; createdAt: string }[];
}

export interface Stats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalUsers: number;
  totalMenuItems: number;
}
