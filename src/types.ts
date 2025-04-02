// types.ts
export interface MenuItem {
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}
