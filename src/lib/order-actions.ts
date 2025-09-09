
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { type CartItem } from '@/context/cart-context';

export type Order = {
    id: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    items: CartItem[];
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    date: string;
};

const ordersFilePath = path.join(process.cwd(), 'src', 'lib', 'orders.json');

// Helper function to read orders from the file
async function readOrders(): Promise<Order[]> {
    try {
        const fileContent = await fs.readFile(ordersFilePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return []; // File doesn't exist, return empty array
        }
        throw error;
    }
}

// Helper function to write orders to the file
async function writeOrders(orders: Order[]): Promise<void> {
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
}


// Simulate a notification service
async function sendAdminNotification(order: Order) {
    const adminEmail = 'noman.dev3@gmail.com';
    const adminWhatsApp = '+923119991972';

    console.log(`
    ---
    SIMULATING NOTIFICATION
    ---
    New Order Received: #${order.id}
    Total: $${order.total.toFixed(2)}
    Customer: ${order.customer.name}

    Sending email to: ${adminEmail}
    Sending WhatsApp to: ${adminWhatsApp}
    ---
    `);
    // In a real app, you would integrate with an email service (e.g., SendGrid)
    // and a WhatsApp API provider here.
    return Promise.resolve();
}


export async function placeOrder(data: {
  customer: { name: string; email: string; phone: string; address: string; };
  items: CartItem[];
  total: number;
}) {
  const orders = await readOrders();
  
  const newOrder: Order = {
    id: `ORD${(orders.length + 1).toString().padStart(3, '0')}`,
    customer: data.customer,
    items: data.items,
    total: data.total,
    status: 'Processing',
    date: new Date().toISOString(),
  };

  orders.unshift(newOrder); // Add new order to the beginning

  await writeOrders(orders);

  // Send notifications after successfully saving the order
  await sendAdminNotification(newOrder);

  return newOrder;
}

export async function getRecentOrders(): Promise<Order[]> {
    const orders = await readOrders();
    return orders.slice(0, 5); // Return the 5 most recent orders
}

export async function getAllOrders(): Promise<Order[]> {
    return await readOrders();
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
    const orders = await readOrders();
    return orders.find(order => order.id === orderId);
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const orders = await readOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
        throw new Error('Order not found');
    }

    orders[orderIndex].status = status;

    await writeOrders(orders);

    return orders[orderIndex];
}
