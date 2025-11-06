import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// SMTP configuration using user's email
const emailUser = Deno.env.get("EMAIL_USER");
const emailPassword = Deno.env.get("EMAIL_APP_PASSWORD");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  to: string;
  subject: string;
  ticketId: string;
  customerName: string;
  message: string;
  isReply?: boolean;
  replyMessage?: string;
  isStatusUpdate?: boolean;
  newStatus?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, ticketId, customerName, message, isReply, replyMessage, isStatusUpdate, newStatus }: TicketEmailRequest = await req.json();

    console.log("Sending email to:", to);

    let emailHtml = "";
    let emailSubject = "";

    if (isStatusUpdate) {
      emailSubject = `Ticket Status Updated - #${ticketId.slice(0, 8)}`;
      const statusMessages = {
        new: "Your ticket has been received and is waiting for review.",
        open: "Your ticket is now being actively worked on by our support team.",
        resolved: "Your ticket has been resolved. If you need further assistance, please reply to this email."
      };
      emailHtml = `
        <h1>Ticket Status Update</h1>
        <p>Hello ${customerName},</p>
        <p>Your support ticket status has been updated to: <strong>${newStatus}</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Ticket ID:</strong> #${ticketId.slice(0, 8)}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Status:</strong> ${newStatus}</p>
          <p>${statusMessages[newStatus as keyof typeof statusMessages] || ""}</p>
        </div>
        <p>If you have any questions, feel free to reach out.</p>
        <p>Best regards,<br>Support Team</p>
      `;
    } else if (isReply) {
      emailSubject = `Re: ${subject} - Ticket #${ticketId.slice(0, 8)}`;
      emailHtml = `
        <h1>Support Team Reply</h1>
        <p>Hello ${customerName},</p>
        <p>Our support team has replied to your ticket:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Your original message:</strong></p>
          <p>${message}</p>
        </div>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Support Team Response:</strong></p>
          <p>${replyMessage}</p>
        </div>
        <p>If you have any further questions, feel free to reach out.</p>
        <p>Best regards,<br>Support Team</p>
      `;
    } else {
      emailSubject = `Support Ticket Received - #${ticketId.slice(0, 8)}`;
      emailHtml = `
        <h1>Thank you for contacting us, ${customerName}!</h1>
        <p>We have received your support ticket and will get back to you as soon as possible.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Your Message:</strong></p>
          <p>${message}</p>
        </div>
        <p>Ticket ID: #${ticketId.slice(0, 8)}</p>
        <p>We typically respond within 24 hours.</p>
        <p>Best regards,<br>Support Team</p>
      `;
    }

    // Send email using SMTP
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: emailUser as string,
          password: emailPassword as string,
        },
      },
    });

    await client.send({
      from: emailUser as string,
      to: to,
      subject: emailSubject,
      content: emailHtml,
      html: emailHtml,
    });

    await client.close();

    console.log("Email sent successfully to:", to);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
