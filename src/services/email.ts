import { Resend } from "resend";

let resend: Resend | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmailNotification(notification: EmailNotification) {
  try {
    const client = getResendClient();
    if (!client) {
      console.warn(
        "RESEND_API_KEY not configured, skipping email notification",
      );
      return;
    }

    const result = await client.emails.send({
      from: process.env.FROM_EMAIL || "Monii <noreply@monii.app>",
      to: notification.to,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
    });

    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export function generateBudgetAlertEmail(data: {
  userName: string;
  categoryName: string;
  currentSpending: number;
  limitAmount: number;
  overAmount: number;
}) {
  const { userName, categoryName, currentSpending, limitAmount, overAmount } =
    data;

  return {
    subject: `🚨 Budget Alert: ${categoryName} Over Budget`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Budget Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert { background: #fee; border-left: 4px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .stats { display: flex; justify-content: space-between; margin: 20px 0; }
            .stat { text-align: center; flex: 1; }
            .stat-value { font-size: 24px; font-weight: bold; color: #f44336; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Budget Alert</h1>
              <p>You've exceeded your budget limit!</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>

              <div class="alert">
                <h3>⚠️ Budget Overrun Detected</h3>
                <p>Your spending in the <strong>${categoryName}</strong> category has exceeded the set limit.</p>
              </div>

              <div class="stats">
                <div class="stat">
                  <div class="stat-value">Rp ${currentSpending.toLocaleString("id-ID")}</div>
                  <div class="stat-label">Current Spending</div>
                </div>
                <div class="stat">
                  <div class="stat-value">Rp ${limitAmount.toLocaleString("id-ID")}</div>
                  <div class="stat-label">Budget Limit</div>
                </div>
                <div class="stat">
                  <div class="stat-value">Rp ${overAmount.toLocaleString("id-ID")}</div>
                  <div class="stat-label">Over Budget</div>
                </div>
              </div>

              <p><strong>What should you do?</strong></p>
              <ul>
                <li>Review your recent transactions in this category</li>
                <li>Consider adjusting your budget limit if needed</li>
                <li>Plan ahead to avoid overspending in the future</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL || "https://monii.app"}/budget" class="button">
                  View Budget Details
                </a>
              </div>

              <p>Stay on top of your finances with Monii! 💰</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from Monii. Please do not reply to this email.</p>
              <p>© 2025 Monii. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Budget Alert: ${categoryName} Over Budget

Hi ${userName},

Your spending in the ${categoryName} category has exceeded the set limit.

Current Spending: Rp ${currentSpending.toLocaleString("id-ID")}
Budget Limit: Rp ${limitAmount.toLocaleString("id-ID")}
Over Budget: Rp ${overAmount.toLocaleString("id-ID")}

Review your recent transactions and adjust your budget if needed.

View details: ${process.env.APP_URL || "https://monii.app"}/budget

Stay on top of your finances with Monii!
    `.trim(),
  };
}
