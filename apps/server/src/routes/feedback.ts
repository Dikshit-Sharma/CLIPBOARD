import { Router } from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';

export const feedbackRouter = Router();

const feedbackSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email(),
  message: z.string().min(1),
  rating: z.number().min(1).max(5)
});

feedbackRouter.post('/', async (req, res) => {
  try {
    const data = feedbackSchema.parse(req.body);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Check if credentials exist
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('----------------------------------------');
      console.log('[Feedback] SMTP credentials missing. Simulating email:');
      console.log(`To: dikshit.sharma2580@gmail.com`);
      console.log(`From: ${data.email} (${data.firstName} ${data.lastName})`);
      console.log(`Subject: SharedClip Feedback: ${data.firstName} ${data.lastName}`);
      console.log(`Body:\nRating: ${data.rating}/5\n${data.message}`);
      console.log('----------------------------------------');

      // In dev mode without creds, verify success to frontend
      return res.json({ success: true, simulated: true });
    }

    const mailOptions = {
      from: process.env.SMTP_USER, // Sender address (setup dependent)
      to: 'dikshit.sharma2580@gmail.com',
      replyTo: data.email,
      subject: `SharedClip Feedback: ${data.firstName} ${data.lastName || ''}`,
      text: `Name: ${data.firstName} ${data.lastName || ''}
Email: ${data.email}
Rating: ${data.rating}/5

Message:
${data.message}`
    };

    await transporter.sendMail(mailOptions);
    console.log('[Feedback] Email sent successfully');
    res.json({ success: true });

  } catch (error) {
    console.error('[Feedback] Error sending email:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to send feedback' });
  }
});
