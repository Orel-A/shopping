export interface Cart {
  shopping_cart_id: number;
  created_date: Date;
  closed: boolean;
  items: CartItem[];
  final_cost: number;
}

export interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  total_cost: number;
  image_url: string;
}

export interface Product {
  product_id: number;
  category_id: number;
  product_name: string;
  price: number;
  image_url: string;
}

export interface Category {
  category_id: number;
  category_name: string;
}