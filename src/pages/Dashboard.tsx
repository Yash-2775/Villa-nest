import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 container mx-auto px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Your bookings will appear here (Firebase coming next).
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
