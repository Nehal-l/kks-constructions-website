/**
 * Email notification service for KKS Constructions using the official Resend API.
 * Replaces legacy SMTP delivery with Resend SDK.
 * All credentials are read from environment variables — never hardcoded.
 */
import "./loadEnv.js";
import { Resend } from "resend";

let _resendClient = null;
let _configured = false;
let _fromEmail = "";

export function maskApiKey(key) {
  if (!key || typeof key !== "string") return "";
  if (key.length <= 8) return "***";
  return `${key.slice(0, 5)}***${key.slice(-4)}`;
}

export function configureMailer() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey) {
    _configured = false;
    _resendClient = null;
    console.log("ℹ️ Email notifications disabled (RESEND_API_KEY not configured).");
    return false;
  }

  // Resend requires a sender address. Default to verified domain or Resend testing domain if not specified.
  _fromEmail = fromEmail || "onboarding@resend.dev";
  _resendClient = new Resend(apiKey);
  _configured = true;

  console.log(` Resend email service configured [key: ${maskApiKey(apiKey)}, from: ${_fromEmail}].`);
  return true;
}

export function isMailerReady() {
  return _configured;
}

/**
 * Send new-enquiry notification to the business inbox via Resend API.
 * Returns { ok, id?, error? } — never throws.
 */
export async function sendEnquiryNotification(enquiry) {
  if (!_configured || !_resendClient) {
    return { ok: false, error: "Resend email service is not configured." };
  }

  const receiver = process.env.ENQUIRY_RECEIVER_EMAIL?.trim();
  if (!receiver) {
    return { ok: false, error: "ENQUIRY_RECEIVER_EMAIL is not configured." };
  }

  const subject = enquiry.subject
    ? `New Enquiry: ${enquiry.subject}`
    : `New Enquiry from ${enquiry.name}`;

  // Format sender address properly: e.g. "KKS Constructions <notifications@yourverifieddomain.com>"
  const from = _fromEmail.includes("<")
    ? _fromEmail
    : `KKS Constructions <${_fromEmail}>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Enquiry</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:640px;margin:0 auto;padding:24px">
  <h2 style="margin-top:0;border-bottom:2px solid #c9a84c;padding-bottom:12px">New Client Enquiry — KKS Constructions</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:8px 0;vertical-align:top;width:160px;color:#555;font-size:14px"><strong>Name</strong></td><td style="padding:8px 0;font-size:14px">${escHtml(enquiry.name)}</td></tr>
    <tr><td style="padding:8px 0;vertical-align:top;color:#555;font-size:14px"><strong>Email</strong></td><td style="padding:8px 0;font-size:14px"><a href="mailto:${escHtml(enquiry.email)}">${escHtml(enquiry.email)}</a></td></tr>
    <tr><td style="padding:8px 0;vertical-align:top;color:#555;font-size:14px"><strong>Phone</strong></td><td style="padding:8px 0;font-size:14px">${escHtml(enquiry.phone)}</td></tr>
    ${enquiry.subject ? `<tr><td style="padding:8px 0;vertical-align:top;color:#555;font-size:14px"><strong>Subject</strong></td><td style="padding:8px 0;font-size:14px">${escHtml(enquiry.subject)}</td></tr>` : ""}
    ${enquiry.project ? `<tr><td style="padding:8px 0;vertical-align:top;color:#555;font-size:14px"><strong>Project</strong></td><td style="padding:8px 0;font-size:14px">${escHtml(enquiry.project)}</td></tr>` : ""}
    <tr><td style="padding:8px 0;vertical-align:top;color:#555;font-size:14px"><strong>Source</strong></td><td style="padding:8px 0;font-size:14px">${escHtml(enquiry.source || "website")}</td></tr>
    <tr><td style="padding:8px 0;vertical-align:top;color:#555;font-size:14px"><strong>Submitted</strong></td><td style="padding:8px 0;font-size:14px">${new Date(enquiry.createdAt || Date.now()).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</td></tr>
  </table>
  <div style="margin-top:20px;background:#f9f7f3;border-left:4px solid #c9a84c;padding:16px 20px">
    <p style="margin:0 0 6px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Message</p>
    <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap">${escHtml(enquiry.message)}</p>
  </div>
  <p style="margin-top:24px;font-size:12px;color:#888">
    Login to the CMS to manage this enquiry and update its status.<br>
    This is an automated notification from KKS Constructions.
  </p>
</body>
</html>`;

  const text = [
    `New Client Enquiry — KKS Constructions`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    enquiry.subject ? `Subject: ${enquiry.subject}` : "",
    enquiry.project ? `Project: ${enquiry.project}` : "",
    `Source: ${enquiry.source || "website"}`,
    ``,
    `Message:`,
    enquiry.message,
  ].filter(Boolean).join("\n");

  try {
    const { data, error } = await _resendClient.emails.send({
      from,
      to: [receiver],
      replyTo: enquiry.email,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("❌ Resend API notification error:", error.message || error.name || error);
      return { ok: false, error: error.message || "Failed to send email via Resend." };
    }

    console.log(` Resend notification email sent successfully [id: ${data?.id}].`);
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("❌ Resend dispatch error:", err.message);
    return { ok: false, error: err.message };
  }
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
