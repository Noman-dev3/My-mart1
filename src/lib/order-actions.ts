'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { type CartItem } from '@/context/cart-context';

type Order = {
    id: string;
    customer: {
        name: string;
        email: string;
    };
    items: CartItem[];
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
    date: string;
};

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
  customer: { name: string; email: string };
  items: CartItem[];
  total: number;
}) {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'orders.json');
  
  let orders: Order[] = [];
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    orders = JSON.parse(fileContent);
  } catch (error) {
    // File might not exist yet, which is fine.
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  const newOrder: Order = {
    id: `ORD${(orders.length + 1).toString().padStart(3, '0')}`,
    customer: data.customer,
    items: data.items,
    total: data.total,
    status: 'Processing',
    date: new Date().toISOString(),
  };

  orders.unshift(newOrder); // Add new order to the beginning

  await fs.writeFile(filePath, JSON.stringify(orders, null, 2));

  // Send notifications after successfully saving the order
  await sendAdminNotification(newOrder);

  return newOrder;
}

export async function getRecentOrders() {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'orders.json');
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const orders: Order[] = JSON.parse(fileContent);
        return orders.slice(0, 5); // Return the 5 most recent orders
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return []; // No orders file yet, return empty array
        }
        throw error;
    }
}
