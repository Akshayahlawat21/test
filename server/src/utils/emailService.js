/**
 * Email service using Nodemailer.
 * In development mode without email config, logs emails to console instead.
 * Provides polished HTML email templates for all transactional emails.
 */
const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

// Only create a real transporter if email credentials are configured
if (env.emailUser && env.emailPass) {
  transporter = nodemailer.createTransport({
    host: env.emailHost,
    port: env.emailPort,
    secure: env.emailPort === 465,
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });
}

/* ─── Base Layout ─── */
const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BirdieBounty</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#fb7185,#f97316,#fbbf24);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">BirdieBounty</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;">Play. Win. Give Back.</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#fafafa;border-top:1px solid #f0f0f0;">
              <p style="margin:0 0 8px;font-size:12px;color:#999;text-align:center;">
                BirdieBounty &mdash; Charity-Powered Golf Platform
              </p>
              <p style="margin:0;font-size:12px;color:#bbb;text-align:center;">
                <a href="${env.frontendUrl}" style="color:#f97316;text-decoration:none;">Visit Website</a>
                &nbsp;&middot;&nbsp;
                <a href="${env.frontendUrl}/dashboard" style="color:#f97316;text-decoration:none;">Dashboard</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:support@birdiebounty.com" style="color:#f97316;text-decoration:none;">Support</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#ccc;text-align:center;">
                If you no longer wish to receive these emails, you can update your
                <a href="${env.frontendUrl}/dashboard" style="color:#999;">notification preferences</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ─── Reusable button ─── */
const emailButton = (text, href) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="border-radius:12px;background:linear-gradient(135deg,#fb7185,#f97316);" align="center">
        <a href="${href}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

/* ─── Send helper ─── */
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log('[Email - Dev Mode] Would send email:');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body: ${html.substring(0, 200)}...`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"BirdieBounty" <${env.emailUser}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
};

/* ─── Welcome Email ─── */
const sendWelcomeEmail = async (user) => {
  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Welcome to BirdieBounty, ${user.name}!</h2>
    <p style="margin:0 0 20px;color:#666;font-size:15px;line-height:1.6;">
      We are thrilled to have you on board. You have joined a community of golfers who believe every round can make a difference.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef7f0;border-radius:12px;padding:0;margin:0 0 24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-weight:700;color:#111;font-size:15px;">Get started in 3 easy steps:</p>
          <p style="margin:0 0 8px;color:#555;font-size:14px;">1. Choose a subscription plan</p>
          <p style="margin:0 0 8px;color:#555;font-size:14px;">2. Pick a charity you care about</p>
          <p style="margin:0;color:#555;font-size:14px;">3. Enter your last 5 Stableford scores</p>
        </td>
      </tr>
    </table>

    ${emailButton('Go to Dashboard', `${env.frontendUrl}/dashboard`)}

    <p style="margin:0;color:#999;font-size:13px;">
      If you have any questions, just reply to this email or reach out to our support team.
    </p>
  `);

  await sendEmail({
    to: user.email,
    subject: 'Welcome to BirdieBounty! Let the giving begin.',
    html,
  });
};

/* ─── Draw Results Email ─── */
const sendDrawResultsEmail = async (user, results) => {
  const matchedText = results.matchedNumbers > 0
    ? `You matched <strong style="color:#111;">${results.matchedNumbers}</strong> number(s)!`
    : 'You did not match any numbers this time &mdash; but there is always next month!';

  const prizeBlock = results.prize > 0
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;margin:20px 0;">
        <tr>
          <td style="padding:24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:1px;">You Won</p>
            <p style="margin:0;font-size:36px;font-weight:800;color:#92400e;">&pound;${results.prize}</p>
          </td>
        </tr>
      </table>`
    : '';

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Your Draw Results Are In!</h2>
    <p style="margin:0 0 20px;color:#666;font-size:15px;line-height:1.6;">
      Hi ${user.name}, the monthly draw has been completed. Here are your results:
    </p>

    <p style="margin:0 0 12px;color:#555;font-size:15px;line-height:1.6;">${matchedText}</p>

    ${prizeBlock}

    ${emailButton('View Full Results', `${env.frontendUrl}/dashboard/draws`)}

    <p style="margin:0;color:#999;font-size:13px;">
      Keep playing and entering your scores for next month's draw. Every round counts!
    </p>
  `);

  await sendEmail({
    to: user.email,
    subject: results.prize > 0
      ? `Draw Results: You won \u00a3${results.prize}!`
      : 'Your Monthly Draw Results Are In!',
    html,
  });
};

/* ─── Winner Alert Email ─── */
const sendWinnerAlertEmail = async (user, prize) => {
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f97316);line-height:72px;font-size:36px;text-align:center;">
        &#127942;
      </div>
    </div>

    <h2 style="margin:0 0 8px;font-size:26px;color:#111;text-align:center;">Congratulations, ${user.name}!</h2>
    <p style="margin:0 0 24px;color:#666;font-size:16px;line-height:1.6;text-align:center;">
      Amazing news &mdash; you are a BirdieBounty winner!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:28px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#065f46;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Prize</p>
          <p style="margin:0;font-size:42px;font-weight:800;color:#065f46;">&pound;${prize}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;color:#555;font-size:15px;line-height:1.6;">
      <strong>What happens next?</strong>
    </p>
    <p style="margin:0 0 6px;color:#666;font-size:14px;">1. Log in to your dashboard to see full details</p>
    <p style="margin:0 0 6px;color:#666;font-size:14px;">2. Upload score verification if required</p>
    <p style="margin:0 0 20px;color:#666;font-size:14px;">3. Your prize will be paid once verified</p>

    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
      And remember &mdash; a share of the prize pool has also been donated to charity on your behalf. Thank you for making golf count!
    </p>

    ${emailButton('Claim Your Prize', `${env.frontendUrl}/dashboard/winnings`)}
  `);

  await sendEmail({
    to: user.email,
    subject: `You won \u00a3${prize} in the BirdieBounty draw!`,
    html,
  });
};

/* ─── Payment Failed Email ─── */
const sendPaymentFailedEmail = async (user) => {
  const html = baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Payment Issue with Your Subscription</h2>
    <p style="margin:0 0 20px;color:#666;font-size:15px;line-height:1.6;">
      Hi ${user.name}, we were unable to process your latest subscription payment.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:12px;margin:0 0 24px;border-left:4px solid #ef4444;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-weight:700;color:#991b1b;font-size:14px;">Action Required</p>
          <p style="margin:0;color:#b91c1c;font-size:14px;line-height:1.5;">
            Please update your payment method to keep your subscription active and continue participating in draws.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">
      If your payment method is not updated within 7 days, your subscription will be paused and you will no longer be entered into monthly draws.
    </p>

    ${emailButton('Update Payment Method', `${env.frontendUrl}/dashboard`)}

    <p style="margin:0;color:#999;font-size:13px;">
      If you believe this is an error, please contact our support team.
    </p>
  `);

  await sendEmail({
    to: user.email,
    subject: 'Action Required: Payment Failed for Your Subscription',
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendDrawResultsEmail,
  sendWinnerAlertEmail,
  sendPaymentFailedEmail,
};
