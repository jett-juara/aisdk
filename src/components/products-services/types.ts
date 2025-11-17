// Product and Service Types for JETT Event Management

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: 'product';
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: 'service';
}

export type ProductOrService = Product | Service;

export interface ProductServicesContent {
  headline: string;
  subheading: string;
  description: string;
  products: Product[];
  services: Service[];
  cta: {
    text: string;
    url: string;
  };
}