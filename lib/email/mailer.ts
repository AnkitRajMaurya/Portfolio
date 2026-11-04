import nodemailer from 'nodemailer';

export async function sendContactNotification(name: string, email: string, message: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Notification skipped.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const mailOptions = {
    from: user,
    to: 'ankit5242raj1@outlook.com',
    subject: `Portfolio Transmission: ${name}`,
    text: `New message received from your portfolio:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nSent at: ${new Date().toISOString()}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #080807; color: #f0eae0; padding: 32px; border-radius: 8px;">
        <h2 style="color: #d97745; margin-top: 0;">Portfolio Transmission Received</h2>
        <p><strong>Operator:</strong> ${name}</p>
        <p><strong>Frequency:</strong> <a href="mailto:${email}" style="color: #f0eae0;">${email}</a></p>
        <hr style="border: none; border-top: 1px solid rgba(240, 234, 224, 0.15); margin: 24px 0;" />
        <h4 style="color: #a69d91; text-transform: uppercase; font-size: 11px; letter-spacing: 0.15em;">Signal Content:</h4>
        <div style="background: #151411; padding: 20px; border-radius: 6px; border: 1px solid rgba(240, 234, 224, 0.1); white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${message}</div>
        <p style="color: #5a544c; font-size: 11px; margin-top: 24px;">Timestamp: ${new Date().toUTCString()}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
}
