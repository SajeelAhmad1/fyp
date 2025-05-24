export interface Product {
    id: string;
    name: string;
    images: string[];
    price: number;
}

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: Product;
}

export interface Payment {
    id: string;
    method: string;
    status: string;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalPrice: number;
    status: string;
    payment: Payment;
    createdAt: string;

    shippingFirstName: string;
    shippingLastName: string;
    shippingStreet: string;
    shippingCity: string;
    shippingState?: string;
    shippingPostalCode: string;
    shippingCountry: string;
    shippingPhone: string;

    billingFirstName?: string;
    billingLastName?: string;
    billingStreet?: string;
    billingCity?: string;
    billingState?: string;
    billingPostalCode?: string;
    billingCountry?: string;

    email: string;
    parcelWeight: number;
}

export interface CustomerProfile {
    firstName: string;
    lastName: string;
    streetAddress: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
}