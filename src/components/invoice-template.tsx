
'use client';

import type { Order } from '@/lib/order-actions';
import { Icons } from './icons';
import { format } from 'date-fns';

type InvoiceTemplateProps = {
  order: Order;
};

export default function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  return (
    <div className="font-sans text-gray-800 bg-white p-4 w-[80mm]">
      <header className="text-center mb-6">
        <Icons.logo className="h-10 w-10 mx-auto text-gray-800" />
        <h1 className="text-2xl font-bold font-headline mt-2">My Mart</h1>
        <p className="text-xs">123 Market Street, Karachi, Pakistan</p>
        <p className="text-xs">Phone: +92 311 9991972</p>
      </header>

      <section className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Order ID:</span>
          <span className="font-mono">{order.id.slice(0, 12)}...</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Date:</span>
          <span>{format(new Date(order.date), 'MMM d, yyyy h:mm a')}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
            <span>Customer:</span>
            <span>{order.customer.name}</span>
        </div>
      </section>

      <table className="w-full text-xs mb-4">
        <thead className="border-b-2 border-dashed">
          <tr>
            <th className="font-semibold text-left py-1">Item</th>
            <th className="font-semibold text-center py-1">Qty</th>
            <th className="font-semibold text-right py-1">Price</th>
            <th className="font-semibold text-right py-1 pr-1">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed">
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="py-1 align-top">{item.name}</td>
              <td className="text-center py-1 align-top">{item.quantity}</td>
              <td className="text-right py-1 align-top">{item.price.toFixed(2)}</td>
              <td className="text-right py-1 pr-1 align-top">
                {(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="border-t-2 border-dashed pt-2">
         <div className="flex justify-between text-xs">
          <span>Subtotal</span>
          <span>{order.total.toFixed(2)}</span>
        </div>
         <div className="flex justify-between text-xs">
          <span>Discount</span>
          <span>0.00</span>
        </div>
         <div className="flex justify-between text-xs">
          <span>Tax</span>
          <span>0.00</span>
        </div>
        <div className="flex justify-between font-bold text-sm mt-2 border-t border-dashed pt-1">
          <span>GRAND TOTAL</span>
          <span>PKR {order.total.toFixed(2)}</span>
        </div>
      </div>


      <footer className="text-center text-xs mt-8">
        <p className="font-semibold">Thank you for your business!</p>
        <p className="mt-2">For returns, please keep the receipt.</p>
        <p>www.mymart.com</p>
      </footer>
    </div>
  );
}
