import { defineAction, ActionError } from 'astro:actions';
import { z } from 'zod';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({
  region: import.meta.env.AWS_REGION ?? 'eu-central-1',
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
      email: z.string().email('Bitte eine gültige E-Mail-Adresse angeben'),
      telefon: z.string().optional(),
      interesse: z.enum(['eisklettern', 'skitouren', 'hochtouren', 'felsklettern', 'allgemein']),
      nachricht: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen haben'),
    }),
    handler: async ({ name, email, telefon, interesse, nachricht }) => {
      const senderAddress = import.meta.env.SES_FROM_EMAIL;
      const recipientAddress = import.meta.env.SES_TO_EMAIL ?? import.meta.env.SES_FROM_EMAIL;

      if (!senderAddress) {
        // In dev mode without SES config, just log
        console.log('[Contact Form Submission]', { name, email, telefon, interesse, nachricht });
        return { success: true, message: 'Nachricht erhalten (dev mode).' };
      }

      const interestLabels: Record<string, string> = {
        eisklettern: 'Eisklettern',
        skitouren: 'Skitouren',
        hochtouren: 'Hochtouren',
        felsklettern: 'Felsklettern',
        allgemein: 'Allgemeine Anfrage',
      };

      const emailBody = `
Neue Kontaktanfrage über korbinian-schmidtner.com

Name: ${name}
E-Mail: ${email}
Telefon: ${telefon || '–'}
Interesse: ${interestLabels[interesse] ?? interesse}

Nachricht:
${nachricht}
      `.trim();

      try {
        await ses.send(
          new SendEmailCommand({
            Source: senderAddress,
            Destination: { ToAddresses: [recipientAddress] },
            ReplyToAddresses: [email],
            Message: {
              Subject: {
                Data: `Anfrage von ${name}: ${interestLabels[interesse] ?? interesse}`,
                Charset: 'UTF-8',
              },
              Body: {
                Text: { Data: emailBody, Charset: 'UTF-8' },
              },
            },
          })
        );

        return { success: true, message: 'Vielen Dank! Ich melde mich so schnell wie möglich.' };
      } catch (err) {
        console.error('SES error:', err);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.',
        });
      }
    },
  }),
};
