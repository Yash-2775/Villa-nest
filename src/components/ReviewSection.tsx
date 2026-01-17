import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Review } from "@/types/villa";

interface ReviewSectionProps {
  villaId: string;
  avgRating: number | null;
}

const ReviewSection = ({ avgRating }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReviews([]);
    setLoading(false);
  }, []);

  if (loading) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-semibold">
        Guest Reviews
      </h3>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">
          Reviews will appear here.
        </p>
      ) : null}
    </div>
  );
};

export default ReviewSection;
