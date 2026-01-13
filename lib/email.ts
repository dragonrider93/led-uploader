import nodemailer from "nodemailer";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const provider = process.env.EMAIL_PROVIDER || "gmail";

  if (provider !== "gmail") {
    throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}`);
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || user,
    to,
    subject,
    html,
  });
}