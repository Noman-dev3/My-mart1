
'use server';

import { type CartItem } from '@/context/cart-context';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { Product } from './product-actions';
import { User } from '@supabase/supabase-js';

// A simpler version of CartItem for Server Actions, containing only primitive types.
export type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    customization?: string;
}

export type PaymentMethod = 'COD' | 'Online' | 'In-Store' | 'Pay on Collection';

export type CustomerInfo = {
    name: string;
    email: string;
    phone: string;
    address: string;
    uid?: string; // Add UID to link orders to Supabase auth users
};


export type Order = {
    id: string;
    customer: CustomerInfo;
    items: OrderItem[];
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Bakery Order';
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
async function sendAdminNotification(order: Order) {
    const adminEmail = 'noman.dev3@gmail.com';
    const adminWhatsApp = '+923119991972';

    const notificationPayload = {
        orderId: order.id,
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
    - Order ID: ${notificationPayload.orderId}
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
  customer: Omit<CustomerInfo, 'uid'>; // uid will be fetched from session
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
}): Promise<Order> {
  const supabase = createServerActionClient({ cookies });

  // Get current user to link the order
  const { data: { user } } = await supabase.auth.getUser();

  const customerData: CustomerInfo = {
    ...data.customer,
    uid: user?.id, // Attach user ID if logged in
  };

  const newOrderData = {
    customer: customerData,
    items: data.items,
    total: data.total,
    status: data.paymentMethod === 'COD' ? 'Processing' : 'Pending',
    paymentMethod: data.paymentMethod,
    date: new Date().toISOString(),
  };

  const { data: savedOrder, error } = await supabase
    .from('orders')
    .insert(newOrderData)
    .select()
    .single();

  if (error) {
    console.error("Error placing order:", error);
    throw new Error("Could not place order.");
  }
  
  // After order is saved, update stock quantities
  for (const item of data.items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
          product_id: item.id,
          quantity_to_decrement: item.quantity
      });
      if (stockError) {
          // In a real-world scenario, you might want to handle this more gracefully,
          // like logging the failure or even attempting to cancel the order.
          console.error(`Failed to decrement stock for product ${item.id}:`, stockError);
      }
  }

  // Send notification *after* order is successfully saved and we have an ID
  if (savedOrder) {
    await sendAdminNotification(savedOrder as Order);
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  revalidatePath('/account');
  
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
    revalidatePath('/account');
    return data as Order;
}

export async function createStoreOrder(data: {
  customerName: string;
  items: OrderItem[];
  total: number;
}): Promise<Order> {
  const supabase = createServerActionClient({ cookies });
  const customerId = `instore-${Date.now()}`;

  const newOrderData = {
    customer: {
        name: data.customerName,
        email: `${customerId}@instore.mymart.local`, // Internal email
        phone: 'N/A',
        address: 'In-Store Purchase'
    },
    items: data.items,
    total: data.total,
    status: 'Delivered' as const, // In-store sales are immediately completed
    paymentMethod: 'In-Store' as PaymentMethod,
    date: new Date().toISOString(),
  };

  const { data: savedOrder, error } = await supabase.from('orders').insert(newOrderData).select().single();

  if (error) {
    console.error('Error creating store order:', error);
    throw new Error('Could not create store order.');
  }

  // Update stock quantities for in-store sales
  for (const item of data.items) {
     const { error: stockError } = await supabase.rpc('decrement_stock', {
        product_id: item.id,
        quantity_to_decrement: item.quantity
     });
     if (stockError) {
        console.error(`POS: Failed to decrement stock for product ${item.id}:`, stockError);
     }
  }


  revalidatePath('/admin/orders');
  revalidatePath('/admin/customers');
  revalidatePath('/admin');

  return savedOrder as Order;
}

export async function placeBakeryOrder(data: {
  product: Product;
  customization: string;
  user: User;
}) {
  const supabase = createServerActionClient({ cookies });

  const { product, customization, user } = data;

  const orderItem: OrderItem = {
    id: product.id,
    name: `${product.name} (Custom)`,
    price: product.price, // Price is for reference, as it's not charged here.
    quantity: 1,
    image: product.image,
    customization: customization
  };

  const newOrderData = {
    customer: {
      uid: user.id,
      name: user.user_metadata.full_name || 'Valued Customer',
      email: user.email || '',
      phone: '', // Can be enhanced later
      address: 'Bakery Order',
    },
    items: [orderItem], // Add customization to the item
    total: product.price, // For reference
    status: 'Bakery Order' as const, // A new status to filter in admin panel
    paymentMethod: 'Pay on Collection' as PaymentMethod,
    date: new Date().toISOString(),
  };

  const { data: savedOrder, error } = await supabase.from('orders').insert(newOrderData).select().single();

  if (error) {
    console.error("Error placing bakery order:", error);
    throw new Error("Could not place the bakery order.");
  }

  // Notify admin
  if (savedOrder) {
    await sendAdminNotification(savedOrder as Order);
  }
  
  revalidatePath('/admin/orders');
  revalidatePath('/account/orders');

  return { success: true };
}
