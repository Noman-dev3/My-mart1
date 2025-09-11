
'use server';

import { type CartItem } from '@/context/cart-context';
import { db } from './firebase';
import { collection, getDocs, doc, addDoc, updateDoc, query, orderBy, serverTimestamp, limit, onSnapshot, getDoc } from 'firebase/firestore';

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

const ordersCollection = collection(db, 'orders');

const processOrderDoc = (doc: any) => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString(),
    } as Order;
}


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
  const newOrder: Omit<Order, 'id'> = {
    customer: data.customer,
    items: data.items,
    total: data.total,
    status: data.paymentMethod === 'COD' ? 'Processing' : 'Pending',
    date: serverTimestamp(),
    paymentMethod: data.paymentMethod,
  };

  await sendAdminNotification(newOrder);

  const docRef = await addDoc(ordersCollection, newOrder);
  
  const savedOrder = await getDoc(doc(db, 'orders', docRef.id));
  return processOrderDoc(savedOrder);
}

async function readOrders(): Promise<Order[]> {
    const q = query(ordersCollection, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(processOrderDoc);
}


export async function getRecentOrders(): Promise<Order[]> {
    const q = query(ordersCollection, orderBy("date", "desc"), limit(5));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(processOrderDoc);
}

export async function getAllOrders(): Promise<Order[]> {
    return await readOrders();
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) {
        return undefined;
    }
    return processOrderDoc(orderDoc);
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });

    const updatedDoc = await getDoc(orderRef);
     if (!updatedDoc) throw new Error('Order not found after update');
    
    return processOrderDoc(updatedDoc);
}
