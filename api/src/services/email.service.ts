import axios from 'axios';
import { env } from '../config/env';

interface WelcomeOpts {
  to: string;
  name: string;
}

interface EmailVerificationOpts {
  to: string;
  name: string;
  verifyUrl: string;
}

interface InvitationOpts {
  to: string;
  name: string;
  role: string;
  inviteUrl: string;
}

interface ApplicationStatusOpts {
  to: string;
  name: string;
  approved: boolean;
}

interface PasswordResetOpts {
  to: string;
  name: string;
  resetUrl: string;
}

interface DecisionOpts {
  to: string;
  name: string;
  title: string;
  decision: 'ACCEPTED' | 'REJECTED' | 'REVISION_NEEDED';
  note?: string;
  journalName: string;
}

interface ReviewAssignedOpts {
  to: string;
  name: string;
  title: string;
  dueDate: string;
  journalName: string;
}

interface PaymentReceiptOpts {
  to: string;
  name: string;
  title: string;
  amount: number;
  currency: string;
  receiptNumber: string;
  journalName: string;
}

// ─── Templates ───────────────────────────────────────────────────────────────

function layout(body: string, previewText: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${previewText}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr style="background:linear-gradient(135deg,#0B1D51,#1a3a8f);">
          <td style="padding:28px 40px;">
            <span style="color:#C8972A;font-size:22px;font-weight:700;letter-spacing:.5px;">Daily Solace Journal</span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;color:#1a1a2e;line-height:1.7;font-size:15px;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr style="background:#f8f8fa;border-top:1px solid #e8e8f0;">
          <td style="padding:20px 40px;font-size:12px;color:#888;text-align:center;">
            Daily Solace Journal &nbsp;·&nbsp; <a href="https://dailysolacejournal.com" style="color:#0B1D51;">dailysolacejournal.com</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email functions ──────────────────────────────────────────────────────────

const sendEmail = async (options: any) => {
  if (env.EMAIL_SERVICE_SECRET.includes('placeholder')) {
    console.log('\n=========================================');
    console.log(`[MOCK EMAIL] To: ${options.to}`);
    console.log(`[MOCK EMAIL] Subject: ${options.subject}`);
    console.log(`[MOCK EMAIL] Body length: ${options.html?.length || 0} chars`);
    console.log('=========================================\n');
    return { id: 'mock_email_id' };
  }

  try {
    const response = await axios.post(`${env.FRONTEND_URL}/api/email/send`, options, {
      headers: {
        Authorization: `Bearer ${env.EMAIL_SERVICE_SECRET}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('[EMAIL SERVICE ERROR]', error.response?.data || error.message);
    throw new Error('Failed to forward email to Vercel microservice');
  }
};

export const emailService = {
  async sendWelcome({ to, name }: WelcomeOpts) {
    return sendEmail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Welcome to Daily Solace Journal',
      html: layout(`
        <h2 style="margin-top:0;color:#0B1D51;">Welcome, ${name}!</h2>
        <p>Thank you for creating an account with Daily Solace Journal.</p>
        <p>You can now submit manuscripts, track your submissions, and manage your profile through our author portal.</p>
      `, 'Welcome to Daily Solace Journal'),
    });
  },

  async sendEmailVerification({ to, name, verifyUrl }: EmailVerificationOpts) {
    return sendEmail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Verify your email address',
      html: layout(`
        <h2 style="margin-top:0;color:#0B1D51;">Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address to complete your registration.</p>
        <div style="margin:30px 0;">
          <a href="${verifyUrl}" style="background:#0B1D51;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;display:inline-block;">Verify Email</a>
        </div>
      `, 'Verify your email address'),
    });
  },

  async sendInvitation({ to, name, role, inviteUrl }: InvitationOpts) {
    return sendEmail({
      from: env.EMAIL_FROM,
      to,
      subject: `Invitation to join as ${role}`,
      html: layout(`
        <h2 style="margin-top:0;color:#0B1D51;">You're Invited!</h2>
        <p>Hi ${name},</p>
        <p>You have been invited to join Daily Solace Journal as a <strong>${role}</strong>.</p>
        <p>Please click the button below to accept the invitation and set up your password.</p>
        <div style="margin:30px 0;">
          <a href="${inviteUrl}" style="background:#0B1D51;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;display:inline-block;">Accept Invitation</a>
        </div>
      `, `Invitation to join as ${role}`),
    });
  },

  async sendReviewerApplicationStatus({ to, name, approved }: ApplicationStatusOpts) {
    const subject = approved ? 'Reviewer Application Approved' : 'Reviewer Application Status';
    const msg = approved 
      ? 'Congratulations! Your application to become a reviewer has been approved. You will receive a separate invitation email shortly to set up your account.'
      : 'Thank you for your interest in becoming a reviewer. After careful consideration, we are unable to accept your application at this time.';
      
    return sendEmail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html: layout(`
        <h2 style="margin-top:0;color:#0B1D51;">Application Status</h2>
        <p>Dear ${name},</p>
        <p>${msg}</p>
      `, subject),
    });
  },

  async sendPasswordReset({ to, name, resetUrl }: PasswordResetOpts) {
    return sendEmail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Password Reset Request',
      html: layout(`
        <h2 style="margin-top:0;color:#0B1D51;">Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.</p>
        <div style="margin:30px 0;">
          <a href="${resetUrl}" style="background:#0B1D51;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;display:inline-block;">Reset Password</a>
        </div>
        <p style="font-size:13px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
      `, 'Reset your password'),
    });
  },

  async sendDecision({ to, name, title, decision, note, journalName }: DecisionOpts) {
    const statuses = {
      ACCEPTED: { color: '#16a34a', text: 'Accepted', msg: 'Congratulations! Your manuscript has been accepted for publication.' },
      REJECTED: { color: '#dc2626', text: 'Rejected', msg: 'We regret to inform you that your manuscript has not been accepted.' },
      REVISION_NEEDED: { color: '#d97706', text: 'Revision Required', msg: 'The reviewers have requested revisions for your manuscript.' },
    };
    const st = statuses[decision];

    return sendEmail({
      from: env.EMAIL_FROM,
      to,
      subject: `[${journalName}] Decision on Manuscript: ${title}`,
      html: layout(`
        <h2 style="margin-top:0;color:#0B1D51;">Decision: <span style="color:${st.color}">${st.text}</span></h2>
        <p>Dear ${name},</p>
        <p>We have reached a decision regarding your submission <strong>"${title}"</strong> to ${journalName}.</p>
        <p style="font-size:16px;font-weight:600;color:${st.color};margin:24px 0;">${st.msg}</p>
        ${note ? `
          <div style="background:#f8f8fa;border-left:4px solid ${st.color};padding:16px;margin:24px 0;white-space:pre-wrap;color:#333;">
            <strong style="display:block;margin-bottom:8px;font-size:12px;text-transform:uppercase;color:#888;">Editor's Note:</strong>
            ${note}
          </div>
        ` : ''}
        <p>Please log in to the author portal for detailed reviews and next steps.</p>
      `, `Decision on your manuscript: ${st.text}`),
    });
  },

  async sendReviewAssigned({ to, name, title, dueDate, journalName }: ReviewAssignedOpts) {
    return sendEmail({
      from: env.EMAIL_FROM,
      to,
      subject: `[${journalName}] Review Request: ${title}`,
      html: layout(`
        <h2 style="margin-top:0;color:#0B1D51;">Review Invitation</h2>
        <p>Dear ${name},</p>
        <p>You have been selected as a reviewer for a manuscript submitted to ${journalName}.</p>
        <div style="background:#f0f4ff;padding:16px;border-radius:6px;margin:20px 0;">
          <p style="margin:0 0 10px 0;"><strong>Manuscript:</strong> ${title}</p>
          <p style="margin:0;"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please log in to the reviewer portal to accept or decline this invitation and view the manuscript abstract.</p>
      `, `New review assignment: "${title}"`),
    });
  },

  async sendPaymentReceipt({ to, name, title, amount, currency, receiptNumber, journalName }: PaymentReceiptOpts) {
    const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount / 100);
    return sendEmail({
      from: env.EMAIL_FROM,
      to,
      subject: `[${journalName}] Payment Receipt — ${receiptNumber}`,
      html: layout(`
        <h2 style="margin-top:0;color:#0B1D51;">Payment Confirmed ✓</h2>
        <p>Dear ${name}, thank you for your payment. Here are your receipt details:</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
          <tr style="background:#f0f4ff;"><td style="padding:10px 14px;font-weight:600;">Receipt No.</td><td style="padding:10px 14px;">${receiptNumber}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;">Manuscript</td><td style="padding:10px 14px;">${title}</td></tr>
          <tr style="background:#f0f4ff;"><td style="padding:10px 14px;font-weight:600;">Journal</td><td style="padding:10px 14px;">${journalName}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;">Amount Paid</td><td style="padding:10px 14px;color:#16a34a;font-weight:700;">${formatted}</td></tr>
        </table>
        <p>Your manuscript will now proceed to the editing and publication stage.</p>
      `, `Payment Receipt ${receiptNumber}`),
    });
  },
};
