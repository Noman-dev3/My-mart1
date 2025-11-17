import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductRatingProps = {
  rating: number;
  className?: string;
  totalReviews?: number;
};

export default function ProductRating({ rating, className, totalReviews }: ProductRatingProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              rating > i ? 'text-chart-4 fill-chart-4' : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
      {totalReviews && <span className="text-xs text-muted-foreground">({totalReviews})</span>}
    </div>
  );
}
