
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const taglines = [
  "Discover products you'll love.",
  "Shop the latest trends with ease.",
  "Your one-stop shop for everything.",
  "Quality goods, delivered fast.",
];

export default function AnimatedAuthText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % taglines.length);
    }, 4000); // Change text every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-24">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="text-3xl font-headline font-bold text-white text-shadow"
        >
          {taglines[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

    