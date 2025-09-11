
'use server';

import { type CartItem } from '@/context/cart-context';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// A simpler version of CartItem for Server Actions, containing only primitive types.
export type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export type PaymentMethod = 'COD' | 'Online';

export type Order = {
    id: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    items: OrderItem[];
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    date: any; // Using `any` for serverTimestamp flexibility
    paymentMethod: PaymentMethod;
};

/**
 * Sends a notification to the store administrator about a new order.
 * In a production environment, this would integrate with a service like SendGrid for email
 * or Twilio for SMS/WhatsApp.
 * 
 * @param order The newly placed order details.
 */
async function sendAdminNotification(order: Omit<Order, 'id' | 'date'>) {
    const adminEmail = 'noman.dev3@gmail.com';
    const adminWhatsApp = '+923119991972';

    const notificationPayload = {
        orderId: `(will be generated upon saving)`,
        customerName: order.customer.name,
        totalAmount: order.total,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        paymentMethod: order.paymentMethod,
    };
    
    let message = `
    ---
    SIMULATING ADMIN NOTIFICATION
    ---
    A new order has been received!

    Details:
    - Customer: ${notificationPayload.customerName}
    - Total: PKR ${notificationPayload.totalAmount.toFixed(2)}
    - Items: ${notificationPayload.itemCount}
    - Payment Method: ${notificationPayload.paymentMethod}
    `;

    if (notificationPayload.paymentMethod === 'Online') {
        message += `
    Action: Awaiting payment confirmation via Foree Pay.`;
    } else {
        message += `
    Action: Order to be prepared for Cash on Delivery.`;
    }

    message += `

    - Sending email notification to: ${adminEmail}
    - Sending WhatsApp notification to: ${adminWhatsApp}
    ---
    In a real app, API calls to SendGrid/Twilio would be made here.
    `
    console.log(message);


    // Example of what a real integration might look like:
    // await sendEmail({ to: adminEmail, subject: 'New Order!', body: '...' });
    // await sendWhatsApp({ to: adminWhatsApp, message: '...' });

    return Promise.resolve();
}

export async function placeOrder(data: {
  customer: { name: string; email: string; phone: string; address: string; };
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
}): Promise<Order> {
  const supabase = createServerActionClient({ cookies });

  const newOrderData = {
    customer: data.customer,
    items: data.items,
    total: data.total,
    status: data.paymentMethod === 'COD' ? 'Processing' : 'Pending',
    paymentMethod: data.paymentMethod,
    date: new Date().toISOString(),
  };

  await sendAdminNotification(newOrderData as Omit<Order, 'id' | 'date'>);

  const { data: savedOrder, error } = await supabase
    .from('orders')
    .insert(newOrderData)
    .select()
    .single();

  if (error) {
    console.error("Error placing order:", error);
    throw new Error("Could not place order.");
  }
  
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  
  return savedOrder as Order;
}


export async function getOrderById(orderId: string): Promise<Order | null> {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
    
    if (error) {
        console.error('Error fetching order by ID:', error);
        return null;
    }
    return data as Order;
}

export async function getOrdersByUser(userEmail: string): Promise<Order[]> {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer->>email', userEmail)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching orders by user', error);
        return [];
    }
    return data as Order[];
}


export async function updateOrderStatus(orderId: string, status: Order['status']) {
    const supabase = createServerActionClient({ cookies });
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        console.error("Error updating order status:", error);
        throw new Error("Could not update order status.");
    }
    
    revalidatePath('/admin/orders');
    revalidatePath(`/order-confirmation/${orderId}`);
    return data as Order;
}
