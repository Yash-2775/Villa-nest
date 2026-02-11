import { Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-slate-50 text-slate-700">
      {/* TOP SECTION */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* BRAND */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-slate-900">
                VillaNest
              </span>
            </div>

            <p className="text-slate-500 leading-relaxed">
              Handcrafting luxury stays for the discerning traveler.
              Your perfect gateway to comfort and style.
            </p>

            <div className="flex gap-4">
              <div className="w-10 h-10 border rounded-full flex items-center justify-center">
                🌐
              </div>
              <div className="w-10 h-10 border rounded-full flex items-center justify-center">
                @
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3 text-slate-500">
              <li>Find a Villa</li>
              <li>List your Property</li>
              <li>Member Perks</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-slate-500">
              <li>Help Center</li>
              <li>Safety Resource</li>
              <li>Cancellation Options</li>
              <li>Trust & Safety</li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">
              Newsletter
            </h4>
            <p className="text-slate-500 mb-4">
              Get updates on new properties and exclusive offers.
            </p>

            <div className="flex gap-2">
              <Input placeholder="Your email" />
              <Button className="bg-primary text-white">
                ➤
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>
            © 2024 VillaNest Luxury Rentals. All rights reserved.
          </p>

          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:underline cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
