
'use server';

import { type CartItem } from '@/context/cart-context';
import { db } from './firebase';
import { collection, getDocs, doc, addDoc, updateDoc, query, orderBy, serverTimestamp, limit, onSnapshot, getDoc } from 'firebase/firestore';

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
    date: any; // Using `any` for serverTimestamp flexibility
};

const ordersCollection = collection(db, 'orders');

async function sendAdminNotification(order: Omit<Order, 'id' | 'date'>) {
    const adminEmail = 'noman.dev3@gmail.com';
    const adminWhatsApp = '+923119991972';

    console.log(`
    ---
    SIMULATING NOTIFICATION
    ---
    New Order Received!
    Total: $${order.total.toFixed(2)}
    Customer: ${order.customer.name}

    Sending email to: ${adminEmail}
    Sending WhatsApp to: ${adminWhatsApp}
    ---
    `);
    return Promise.resolve();
}

export async function placeOrder(data: {
  customer: { name: string; email: string; phone: string; address: string; };
  items: CartItem[];
  total: number;
}) {
  const newOrder: Omit<Order, 'id'> = {
    customer: data.customer,
    items: data.items,
    total: data.total,
    status: 'Processing',
    date: serverTimestamp(),
  };

  const docRef = await addDoc(ordersCollection, newOrder);

  // Send notifications after successfully saving the order
  await sendAdminNotification(newOrder);

  return { ...newOrder, id: docRef.id };
}

async function readOrders(): Promise<Order[]> {
    const q = query(ordersCollection, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamp to ISO string for client-side compatibility
            date: data.date.toDate().toISOString(),
        } as Order;
    });
}


export async function getRecentOrders(): Promise<Order[]> {
    const q = query(ordersCollection, orderBy("date", "desc"), limit(5));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
         const data = doc.data();
         return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
         } as Order
    });
}

export async function getAllOrders(): Promise<Order[]> {
    return await readOrders();
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) {
        return undefined;
    }
    const data = orderDoc.data();
    return {
        id: orderDoc.id,
        ...data,
        date: data.date.toDate().toISOString(),
    } as Order;
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });

    const updatedDoc = await getDoc(orderRef);
    const updatedData = updatedDoc.data();

     if (!updatedData) throw new Error('Order not found after update');

    return {
        id: updatedDoc.id,
        ...updatedData,
        date: updatedData.date.toDate().toISOString()
    } as Order;
}
