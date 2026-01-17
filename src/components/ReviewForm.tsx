import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import BookingEngine from "@/components/BookingEngine";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { Button } from "@/components/ui/button";

const VillaDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  if (!id) {
    return <p>Villa not found</p>;
  }

  /* TEMP villa object — will be replaced later */
  const villa = {
    id,
    name: "Sample Villa",
    location: "Demo Location",
    price_per_night: 5000,
    amenities: [],
    description: "",
    type: "Villa",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 container mx-auto px-4 max-w-5xl space-y-12">
        {/* ---------------- VILLA HEADER ---------------- */}
        <section>
          <h1 className="font-display text-3xl font-semibold mb-2">
            {villa.name}
          </h1>

          <p className="text-muted-foreground mb-6">
            {villa.location}
          </p>
        </section>

        {/* ---------------- BOOKING ENGINE ---------------- */}
        <section>
          <BookingEngine villa={villa as any} />
        </section>

        {/* ---------------- REVIEWS ---------------- */}
        <section className="max-w-2xl">
          <h2 className="font-display text-2xl mb-4">
            Guest Reviews
          </h2>

          {/* Review Form */}
          {user ? (
            <div className="mb-6">
              <ReviewForm villaId={villa.id} />
            </div>
          ) : (
            <p className="text-muted-foreground mb-6">
              Please login to write a review.
            </p>
          )}

          {/* Review List */}
          <ReviewList villaId={villa.id} />
        </section>

        {/* ---------------- BACK ---------------- */}
        <Link to="/">
          <Button variant="outline">Back</Button>
        </Link>
      </main>
    </div>
  );
};

export default VillaDetails;
