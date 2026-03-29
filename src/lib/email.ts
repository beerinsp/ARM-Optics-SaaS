import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "noreply@armoptics.com.au";

export interface GlassesReadyParams {
  to: string;
  customerFirstName: string;
  orderNumber: string;
  locale?: "en" | "bg";
}

const GLASSES_READY_CONTENT = {
  en: {
    subject: (orderNumber: string) => `Your glasses are ready – ${orderNumber}`,
    heading: "Your glasses are ready!",
    greeting: (name: string) => `Hi ${name},`,
    body: (orderNumber: string) =>
      `Great news — your order <strong>${orderNumber}</strong> is ready for collection at ARM Optics.`,
    instructions: "Please bring this email or your receipt slip when you come to collect.",
    footer: "ARM Optics | Your vision, our expertise.",
  },
  bg: {
    subject: (orderNumber: string) => `Вашите очила са готови – ${orderNumber}`,
    heading: "Вашите очила са готови!",
    greeting: (name: string) => `Здравейте, ${name},`,
    body: (orderNumber: string) =>
      `Радваме се да Ви съобщим, че поръчка <strong>${orderNumber}</strong> е готова за получаване в ARM Optics.`,
    instructions: "Моля, носете този имейл или касовата бележка при получаване.",
    footer: "ARM Optics | Вашето зрение, нашата грижа.",
  },
} as const;

export async function sendGlassesReadyEmail({
  to,
  customerFirstName,
  orderNumber,
  locale = "en",
}: GlassesReadyParams) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const c = GLASSES_READY_CONTENT[locale];
  return resend.emails.send({
    from: FROM,
    to: [to],
    subject: c.subject(orderNumber),
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
        <h2 style="color: #1a1a1a;">${c.heading}</h2>
        <p>${c.greeting(customerFirstName)}</p>
        <p>${c.body(orderNumber)}</p>
        <p>${c.instructions}</p>
        <p style="margin-top: 24px; color: #666; font-size: 13px;">
          ${c.footer}
        </p>
      </div>
    `,
  });
}
