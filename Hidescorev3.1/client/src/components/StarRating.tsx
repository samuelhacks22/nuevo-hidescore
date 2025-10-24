import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md",
  interactive = false,
  onRatingChange,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      // Allow half-star ratings by clicking left/right half of star
      onRatingChange(index);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)} data-testid="star-rating">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const fillPercentage = Math.min(Math.max((rating - index) * 100, 0), 100);
        
        return (
          <div
            key={index}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover-elevate active-elevate-2 rounded-sm"
            )}
            onClick={() => handleClick(starValue)}
            data-testid={`star-${starValue}`}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                "text-muted-foreground"
              )}
            />
            {/* Foreground star (filled) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "fill-primary text-primary"
                )}
              />
            </div>
          </div>
        );
      })}
      {rating > 0 && (
        <span className="ml-1 text-sm text-muted-foreground" data-testid="rating-value">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
