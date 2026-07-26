import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { emailService } from './email.service';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

// ─── Create order ─────────────────────────────────────────────────────────────

export async function createApcOrder(submissionId: string, userId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { journal: true, author: true, payment: true },
  });
  if (!submission) throw new AppError(404, 'Submission not found');
  if (submission.authorId !== userId) throw new AppError(403, 'Forbidden');
  if (submission.payment) throw new AppError(409, 'Payment already exists for this submission');
  if (submission.journal.apcAmount === 0) throw new AppError(400, 'This journal has no APC');

  const receiptNumber = `DSJ-${Date.now()}`;
  const order = await razorpay.orders.create({
    amount: submission.journal.apcAmount,
    currency: submission.journal.currency,
    receipt: receiptNumber,
    notes: { submissionId, userId },
  });

  const payment = await prisma.payment.create({
    data: {
      submissionId,
      userId,
      amount: submission.journal.apcAmount,
      currency: submission.journal.currency,
      razorpayOrderId: order.id as string,
      receiptNumber,
    },
  });

  return {
    orderId: order.id,
    amount: payment.amount,
    currency: payment.currency,
    keyId: env.RAZORPAY_KEY_ID,
  };
}

// ─── Verify payment signature (called after Razorpay checkout) ────────────────

export async function verifyAndConfirmPayment(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  // 1. Verify HMAC signature
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
    .digest('hex');

  if (expected !== data.razorpaySignature) {
    throw new AppError(400, 'Payment signature verification failed');
  }

  // 2. Update payment record
  const payment = await prisma.payment.update({
    where: { razorpayOrderId: data.razorpayOrderId },
    data: {
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
      status: 'PAID',
      paidAt: new Date(),
    },
    include: {
      submission: { include: { journal: true } },
      user: true,
    },
  });

  // 3. Send receipt email
  await emailService.sendPaymentReceipt({
    to: payment.user.email,
    name: payment.user.name,
    title: payment.submission.title,
    amount: payment.amount,
    currency: payment.currency,
    receiptNumber: payment.receiptNumber!,
    journalName: payment.submission.journal.name,
  });

  return payment;
}

// ─── Webhook handler (called by Razorpay server-side) ─────────────────────────

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
