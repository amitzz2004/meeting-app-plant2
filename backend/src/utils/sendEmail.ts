import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false
  }
});

export const sendApprovalEmail = async (email: string, name: string) => {
  try {
    const mailOptions = {
      from: `"DEE Piping System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Account Has Been Approved - DEE Piping System",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#f0f4f8; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
          
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

                  <!-- TOP ACCENT BAR -->
                  <tr>
                    <td style="background: linear-gradient(90deg, #0EA5E9, #0b2c4a); height: 5px; border-radius: 8px 8px 0 0;"></td>
                  </tr>

                  <!-- HEADER -->
                  <tr>
                    <td style="background: #0b2c4a; padding: 36px 48px; border-radius: 0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0; color:#0EA5E9; font-size:20px; font-weight:700; letter-spacing:2px;">DEE PIPING SYSTEM</p>
                            <p style="margin:6px 0 0; color:rgba(255,255,255,0.45); font-size:12px; letter-spacing:0.5px;">INHOUSE MEETING ROOM BOOKING PLATFORM</p>
                          </td>
                          <td align="right">
                            <div style="background:rgba(14,165,233,0.15); border:1px solid rgba(14,165,233,0.3); border-radius:50%; width:48px; height:48px; text-align:center; line-height:48px; font-size:22px;"></div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- SUCCESS BANNER -->
                  <tr>
                    <td style="background:#16a34a; padding: 18px 48px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0; color:#ffffff; font-size:16px; font-weight:600;">&nbsp;Account Successfully Approved</p>
                          </td>
                          <td align="right">
                            <p style="margin:0; color:rgba(255,255,255,0.7); font-size:12px;">${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- BODY -->
                  <tr>
                    <td style="background:#ffffff; padding: 48px;">

                      <p style="margin:0 0 8px; color:#94a3b8; font-size:13px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Hello,</p>
                      <h2 style="margin:0 0 24px; color:#0b2c4a; font-size:26px; font-weight:700;">${name} 👋</h2>

                      <p style="margin:0 0 20px; color:#475569; font-size:15px; line-height:1.8;">
                        We're excited to let you know that your account registration request for the 
                        <strong style="color:#0b2c4a;">DEE Piping System</strong> has been reviewed and 
                        <strong style="color:#16a34a;">approved</strong> by the administrator.
                      </p>

                      <p style="margin:0 0 32px; color:#475569; font-size:15px; line-height:1.8;">
                        You now have full access to the Inhouse Meeting Room Booking Platform. 
                        Start exploring and book your meeting rooms with ease.
                      </p>

                      <!-- ACCOUNT CARD -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:32px;">
                        <tr>
                          <td style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0;">
                            <p style="margin:0; color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Account Information</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Full Name</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${name}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Email Address</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${email}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color:#64748b; font-size:13px;">Account Status</span>
                                </td>
                                <td align="right" style="padding: 8px 0;">
                                  <span style="background:#dcfce7; color:#16a34a; font-size:12px; font-weight:600; padding:4px 12px; border-radius:20px;">● APPROVED</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- WHAT YOU CAN DO -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
                        <tr>
                          <td style="padding-bottom:16px;">
                            <p style="margin:0; color:#0b2c4a; font-size:15px; font-weight:700;">What you can do now:</p>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:10px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0EA5E9; font-size:16px; margin-right:12px;">📅</span>
                                  <span style="color:#475569; font-size:14px;">Book meeting rooms instantly</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:10px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0EA5E9; font-size:16px; margin-right:12px;">🏢</span>
                                  <span style="color:#475569; font-size:14px;">Browse available rooms and capacities</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:10px 0;">
                                  <span style="color:#0EA5E9; font-size:16px; margin-right:12px;">📋</span>
                                  <span style="color:#475569; font-size:14px;">Manage and track your bookings</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA BUTTON -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                        <tr>
                          <td align="center">
                            <a href="http://deemeetingsplant2.deepiping.com:802/"
                               style="display:inline-block; background:#0b2c4a; color:#ffffff; 
                                      padding:16px 48px; border-radius:8px; font-size:15px; 
                                      font-weight:600; text-decoration:none; letter-spacing:0.5px;">
                              Login to DEE Piping System →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center; line-height:1.6;">
                        Having trouble? Contact your system administrator.<br>
                        <span style="color:#cbd5e1;">This is an automated email, please do not reply.</span>
                      </p>

                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background:#0b2c4a; padding:24px 48px; border-radius:0 0 8px 8px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0; color:#0EA5E9; font-size:13px; font-weight:600;">DEE PIPING SYSTEM</p>
                            <p style="margin:4px 0 0; color:rgba(255,255,255,0.3); font-size:11px;">Inhouse Meeting Room Booking Platform</p>
                          </td>
                          <td align="right">
                            <p style="margin:0; color:rgba(255,255,255,0.3); font-size:11px;">Amit GAT- CMD's Office</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- BOTTOM ACCENT BAR -->
                  <tr>
                    <td style="background: linear-gradient(90deg, #0b2c4a, #0EA5E9); height:4px; border-radius:0 0 8px 8px;"></td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};