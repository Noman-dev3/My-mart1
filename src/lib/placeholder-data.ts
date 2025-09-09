export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Electronics' | 'Groceries' | 'Fashion' | 'Home Goods';
  rating: number;
  reviews: number;
  brand: string;
  inStock: boolean;
  specifications: Record<string, string>;
  reviewsData: {
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
};

export const products: Product[] = [
  {
    id: 'prod_001',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in music with these high-fidelity wireless headphones. Featuring active noise cancellation and a 30-hour battery life.',
    price: 249.99,
    image: 'https://picsum.photos/600/600?random=1',
    category: 'Electronics',
    rating: 5,
    reviews: 125,
    brand: 'SoundWave',
    inStock: true,
    specifications: {
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Noise Cancellation': 'Active Noise Cancellation',
      'Weight': '250g',
    },
    reviewsData: [
      { author: 'Alex', rating: 5, comment: 'Best headphones I\'ve ever owned. The noise cancellation is unreal!', date: '2023-05-15' },
      { author: 'Maria', rating: 5, comment: 'Incredible sound quality and very comfortable to wear for long periods.', date: '2023-05-12' },
    ]
  },
  {
    id: 'prod_002',
    name: 'Organic Avocadoes (4-pack)',
    description: 'Fresh, creamy, and organically grown. Perfect for toast, salads, or guacamole.',
    price: 5.99,
    image: 'https://picsum.photos/600/600?random=2',
    category: 'Groceries',
    rating: 4,
    reviews: 88,
    brand: 'MyMart Fresh',
    inStock: true,
    specifications: {
      'Origin': 'California',
      'Certification': 'USDA Organic',
      'Quantity': '4 avocados',
      'Storage': 'Refrigerate after ripening',
    },
    reviewsData: [
        { author: 'John', rating: 4, comment: 'Great quality avocados, very creamy.', date: '2023-06-20' },
        { author: 'Jane', rating: 5, comment: 'Always fresh and delicious. Perfect for my morning toast.', date: '2023-06-18' },
    ]
  },
  {
    id: 'prod_003',
    name: 'Classic Cotton T-Shirt',
    description: 'A wardrobe staple. Made from 100% premium, soft-touch cotton for ultimate comfort.',
    price: 29.99,
    image: 'https://picsum.photos/600/600?random=3',
    category: 'Fashion',
    rating: 5,
    reviews: 210,
    brand: 'Urban Threads',
    inStock: true,
    specifications: {
      'Material': '100% Premium Cotton',
      'Fit': 'Regular',
      'Care': 'Machine wash cold',
      'Origin': 'Made in USA',
    },
    reviewsData: [
        { author: 'Michael', rating: 5, comment: 'Super soft and fits perfectly. I bought one in every color!', date: '2023-07-01' },
        { author: 'Sarah', rating: 5, comment: 'Excellent quality t-shirt. It holds up well after washing.', date: '2023-06-28' },
    ]
  },
  {
    id: 'prod_004',
    name: 'Smart LED Desk Lamp',
    description: 'Adjustable brightness and color temperature to suit your mood. Control via app or voice assistant.',
    price: 45.50,
    image: 'https://picsum.photos/600/600?random=4',
    category: 'Home Goods',
    rating: 4,
    reviews: 67,
    brand: 'CozyHome',
    inStock: false,
    specifications: {
      'Power': '10W',
      'Color Temperature': '2700K - 6500K',
      'Control': 'App & Voice Control',
      'Lifespan': '25,000 hours',
    },
    reviewsData: [
        { author: 'David', rating: 4, comment: 'Great lamp for my desk setup. The app control is very convenient.', date: '2023-04-10' },
        { author: 'Emily', rating: 4, comment: 'I love the adjustable color temperature. It\'s great for reading at night.', date: '2023-04-05' },
    ]
  },
  {
    id: 'prod_005',
    name: '4K Ultra HD Smart TV',
    description: 'Experience breathtaking clarity and vibrant colors. Stream your favorite shows from all major platforms.',
    price: 499.99,
    image: 'https://picsum.photos/600/600?random=5',
    category: 'Electronics',
    rating: 5,
    reviews: 302,
    brand: 'Visionary',
    inStock: true,
    specifications: {
      'Screen Size': '55 inches',
      'Resolution': '4K Ultra HD (3840 x 2160)',
      'Smart TV Platform': 'Visionary OS',
      'Ports': '3 x HDMI, 2 x USB',
    },
    reviewsData: [
        { author: 'Chris', rating: 5, comment: 'Stunning picture quality! It feels like I have a cinema in my living room.', date: '2023-08-15' },
        { author: 'Jessica', rating: 5, comment: 'The smart features are fast and easy to use. Great value for the price.', date: '2023-08-10' },
    ]
  },
  {
    id: 'prod_006',
    name: 'Artisanal Sourdough Bread',
    description: 'Handcrafted with a traditional starter. A crispy crust and a soft, airy interior.',
    price: 7.49,
    image: 'https://picsum.photos/600/600?random=6',
    category: 'Groceries',
    rating: 5,
    reviews: 150,
    brand: 'The Bakehouse',
    inStock: true,
    specifications: {
      'Ingredients': 'Flour, Water, Salt, Sourdough Starter',
      'Weight': '750g',
      'Allergens': 'Contains Gluten',
      'Shelf Life': '3-4 days',
    },
    reviewsData: [
        { author: 'Tom', rating: 5, comment: 'The best sourdough I have ever tasted. The crust is perfect.', date: '2023-09-05' },
        { author: 'Anna', rating: 5, comment: 'Absolutely delicious. I buy this every week.', date: '2023-09-02' },
    ]
  },
  {
    id: 'prod_007',
    name: 'Leather Messenger Bag',
    description: 'Stylish and durable, this genuine leather bag is perfect for work or travel. Fits a 15-inch laptop.',
    price: 120.00,
    image: 'https://picsum.photos/600/600?random=7',
    category: 'Fashion',
    rating: 4,
    reviews: 55,
    brand: 'Nomad Gear',
    inStock: true,
    specifications: {
      'Material': '100% Genuine Leather',
      'Dimensions': '16" x 12" x 4"',
      'Laptop Sleeve': 'Fits up to 15" laptop',
      'Color': 'Cognac Brown',
    },
    reviewsData: [
      { author: 'Peter', rating: 5, comment: 'High-quality bag, looks even better in person. Lots of compartments.', date: '2023-03-20' },
      { author: 'Linda', rating: 4, comment: 'Very stylish and functional. The leather is a bit stiff at first but softens up.', date: '2023-03-15' },
    ]
  },
  {
    id: 'prod_008',
    name: 'Plush Velvet Throw Pillow',
    description: 'Add a touch of elegance to your living space with this luxuriously soft velvet pillow.',
    price: 35.00,
    image: 'https://picsum.photos/600/600?random=8',
    category: 'Home Goods',
    rating: 5,
    reviews: 42,
    brand: 'CozyHome',
    inStock: true,
    specifications: {
      'Material': 'Velvet Cover, Polyester Fill',
      'Dimensions': '18" x 18"',
      'Care': 'Spot clean only',
      'Color': 'Emerald Green',
    },
    reviewsData: [
      { author: 'Sophia', rating: 5, comment: 'So soft and the color is gorgeous. It adds a perfect pop to my sofa.', date: '2023-02-14' },
      { author: 'Daniel', rating: 5, comment: 'Great quality pillow, very plush and comfortable.', date: '2023-02-10' },
    ]
  },
  {
    id: 'prod_009',
    name: 'Portable Bluetooth Speaker',
    description: 'Take your music anywhere. This speaker is waterproof, dustproof, and has a 12-hour playtime.',
    price: 79.99,
    image: 'https://picsum.photos/600/600?random=9',
    category: 'Electronics',
    rating: 4,
    reviews: 98,
    brand: 'SoundWave',
    inStock: true,
    specifications: {
      'Connectivity': 'Bluetooth 5.1',
      'Battery Life': '12 hours',
      'Waterproofing': 'IPX7',
      'Weight': '540g',
    },
    reviewsData: [
      { author: 'Kevin', rating: 4, comment: 'Sounds great for its size and the battery lasts a long time.', date: '2023-01-25' },
      { author: 'Laura', rating: 5, comment: 'Perfect for the beach! I don\'t have to worry about it getting wet.', date: '2023-01-22' },
    ]
  },
  {
    id: 'prod_010',
    name: 'Gourmet Coffee Beans',
    description: 'A rich and aromatic medium roast blend, ethically sourced from single-origin farms.',
    price: 18.99,
    image: 'https://picsum.photos/600/600?random=10',
    category: 'Groceries',
    rating: 5,
    reviews: 189,
    brand: 'The Daily Grind',
    inStock: true,
    specifications: {
      'Roast': 'Medium',
      'Origin': 'Colombia',
      'Weight': '12 oz (340g)',
      'Flavor Notes': 'Chocolate, Caramel, Citrus',
    },
    reviewsData: [
      { author: 'Rachel', rating: 5, comment: 'My new favorite coffee. So smooth and flavorful.', date: '2023-10-30' },
      { author: 'Mark', rating: 5, comment: 'Excellent beans. Makes a perfect cup of coffee every morning.', date: '2023-10-28' },
    ]
  },
  {
    id: 'prod_011',
    name: 'Performance Running Shoes',
    description: 'Lightweight and responsive, engineered for speed and comfort on your daily runs.',
    price: 130.00,
    image: 'https://picsum.photos/600/600?random=11',
    category: 'Fashion',
    rating: 5,
    reviews: 164,
    brand: 'Apex Runners',
    inStock: true,
    specifications: {
      'Use': 'Road Running',
      'Cushioning': 'Medium',
      'Weight': '280g (Men\'s size 9)',
      'Drop': '8mm',
    },
    reviewsData: [
      { author: 'Ben', rating: 5, comment: 'Feels like I\'m running on clouds. Great support and very lightweight.', date: '2023-11-12' },
      { author: 'Chloe', rating: 5, comment: 'These shoes have improved my running times. Highly recommend!', date: '2023-11-10' },
    ]
  },
  {
    id: 'prod_012',
    name: 'Scented Soy Wax Candle',
    description: 'Create a relaxing ambiance with this lavender and chamomile scented candle. 50-hour burn time.',
    price: 24.99,
    image: 'https://picsum.photos/600/600?random=12',
    category: 'Home Goods',
    rating: 4,
    reviews: 73,
    brand: 'CozyHome',
    inStock: false,
    specifications: {
      'Scent': 'Lavender & Chamomile',
      'Wax': '100% Soy Wax',
      'Burn Time': 'Approx. 50 hours',
      'Wick': 'Cotton',
    },
    reviewsData: [
      { author: 'Olivia', rating: 4, comment: 'Lovely scent, very relaxing. I wish it was a little stronger.', date: '2023-12-05' },
      { author: 'George', rating: 5, comment: 'Smells amazing and burns cleanly. Helps me unwind after a long day.', date: '2023-12-01' },
    ]
  },
];

export const categories = [...new Set(products.map((p) => p.category))];
export const brands = [...new Set(products.map((p) => p.brand))];
