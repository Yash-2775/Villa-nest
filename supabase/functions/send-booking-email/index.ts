import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  guestName: string;
  guestEmail: string;
  villaName: string;
  villaLocation: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  bookingType: string;
  paymentMethod: string;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      guestName,
      guestEmail,
      villaName,
      villaLocation,
      startDate,
      endDate,
      totalPrice,
      bookingType,
      paymentMethod,
      status,
    }: BookingEmailRequest = await req.json();

    console.log("Sending booking confirmation email to:", guestEmail);

    const isHourly = bookingType === "hourly";
    const dateDisplay = startDate === endDate 
      ? startDate 
      : `${startDate} to ${endDate}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking ${status === "confirmed" ? "Confirmed! ✓" : "Reserved"}</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #18181b; margin-bottom: 5px;">Hello ${guestName},</p>
            <p style="color: #71717a; margin-top: 0;">Thank you for booking with VillaNest! Here are your booking details:</p>
            
            <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h2 style="color: #18181b; margin: 0 0 15px 0; font-size: 20px;">${villaName}</h2>
              <p style="color: #71717a; margin: 0 0 5px 0;">📍 ${villaLocation}</p>
              
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 15px 0;">
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Booking Type</td>
                  <td style="padding: 8px 0; color: #18181b; text-align: right; font-weight: 600;">${isHourly ? "Day Visit" : "Overnight Stay"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Date(s)</td>
                  <td style="padding: 8px 0; color: #18181b; text-align: right; font-weight: 600;">${dateDisplay}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Payment Method</td>
                  <td style="padding: 8px 0; color: #18181b; text-align: right; font-weight: 600;">${paymentMethod?.toUpperCase() || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Status</td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="background: ${status === "confirmed" ? "#059669" : "#f59e0b"}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                      ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                </tr>
              </table>
              
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 15px 0;">
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #18181b; font-size: 18px; font-weight: 700;">Total Amount</td>
                  <td style="padding: 8px 0; color: #059669; text-align: right; font-size: 24px; font-weight: 700;">₹${totalPrice.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            ${paymentMethod === "cod" ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">💰 Payment on Arrival</p>
              <p style="margin: 5px 0 0 0; color: #a16207; font-size: 14px;">Please ensure you have the exact amount ready at check-in.</p>
            </div>
            ` : ""}
            
            <p style="color: #71717a; font-size: 14px; margin-top: 25px;">
              If you have any questions, feel free to reply to this email or contact our support team.
            </p>
            
            <p style="color: #18181b; margin-top: 25px;">
              Best regards,<br>
              <strong>The VillaNest Team</strong>
            </p>
          </div>
          
          <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 20px;">
            © 2024 VillaNest. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VillaNest <onboarding@resend.dev>",
        to: [guestEmail],
        subject: `Booking ${status === "confirmed" ? "Confirmed" : "Reserved"}: ${villaName}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
