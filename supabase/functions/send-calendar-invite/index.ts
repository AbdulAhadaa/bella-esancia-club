import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CalendarInviteRequest {
  customerEmail: string;
  date: string;
  time: string;
  customerName: string;
  timezone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, date, time, customerName, timezone }: CalendarInviteRequest = await req.json();

    // Create calendar event details
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes later

    const eventDetails = {
      summary: `Scanner Facial - ${customerName}`,
      description: `Cita de 30 minutos para análisis facial con scanner AI.\n\nCliente: ${customerName}\nEmail: ${customerEmail}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone,
      },
      attendees: [
        { email: customerEmail },
        { email: 'hola@skincarehana.com' },
        { email: 'hola@nuabok.com' }
      ],
    };

    // Create ICS content for calendar invite
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nuabok//Scanner Facial//ES',
      'BEGIN:VEVENT',
      `UID:${crypto.randomUUID()}@nuabok.com`,
      `DTSTART:${formatDate(startDateTime)}`,
      `DTEND:${formatDate(endDateTime)}`,
      `SUMMARY:Scanner Facial - ${customerName}`,
      `DESCRIPTION:Cita de 30 minutos para análisis facial con scanner AI.\\n\\nCliente: ${customerName}\\nEmail: ${customerEmail}`,
      `ATTENDEE:MAILTO:${customerEmail}`,
      'ATTENDEE:MAILTO:hola@skincarehana.com',
      'ATTENDEE:MAILTO:hola@nuabok.com',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    console.log('Calendar invite created successfully for:', customerEmail);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Calendar invite created',
      icsContent: icsContent 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-calendar-invite function:", error);
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