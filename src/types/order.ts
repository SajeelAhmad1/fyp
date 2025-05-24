export interface Order {
    id: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            name: string;
            images: string[];
            sku: string;
            discount: number,
            id: number
        };
    }>;
}