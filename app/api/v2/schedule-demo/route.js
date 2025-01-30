import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'maneprathamesh019@gmail.com',
    pass: 'ppmn ujpq uivu ovzg'
  }
});

const generateCredentials = () => {
  const username = `demo_${Math.random().toString(36).substring(7)}`;
  const password = Math.random().toString(36).substring(7);
  return { username, password };
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;
    const credentials = generateCredentials();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 8px 8px;
            }
            .credentials {
              background-color: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .important-notes {
              border-left: 4px solid #2563eb;
              padding-left: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
            .button {
              background-color:#f3f4f6 ;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to EduMatrix Pro</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for scheduling a demo with us. We're excited to have you explore our platform!</p>
              
              <div class="credentials">
                <h2>Your Demo Access Credentials</h2>
                <p><strong>Username:</strong> ${credentials.username}</p>
                <p><strong>Password:</strong> ${credentials.password}</p>
              </div>

              <div class="important-notes">
                <h3>Important Information</h3>
                <ul>
                  <li>These credentials are valid for the next 7 days</li>
                  <li>The demo platform is available 24/7</li>
                  <li>Our support team is ready to assist you with any questions</li>
                </ul>
              </div>

              <a href="https://erp-attendance.vercel.app/" class="button">Access Demo Platform</a>

              <div class="footer">
                <p>Best regards,<br>EduMatrix Pro Team</p>
                <p>© 2025 EduMatrix Pro. All rights reserved.</p>
                <p>
                  Need help? Contact us at support@edumatrixpro.com<br>
                  Follow us on <a href="#">LinkedIn</a> | <a href="#">Twitter</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: '"EduMatrix Pro" <noreply@edumatrixpro.com>',
      to: email,
      subject: 'Welcome to EduMatrix Pro - Your Demo Access Credentials',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Demo scheduled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Failed to schedule demo' },
      { status: 500 }
    );
  }
}