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

// ✅ 1. Send approval email to user when account is approved
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
                  <tr>
                    <td style="background: linear-gradient(90deg, #0EA5E9, #0b2c4a); height: 5px; border-radius: 8px 8px 0 0;"></td>
                  </tr>
                  <tr>
                    <td style="background: #0b2c4a; padding: 36px 48px;">
                      <p style="margin:0; color:#0EA5E9; font-size:20px; font-weight:700; letter-spacing:2px;">DEE PIPING SYSTEM</p>
                      <p style="margin:6px 0 0; color:rgba(255,255,255,0.45); font-size:12px;">INHOUSE MEETING ROOM BOOKING PLATFORM</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#16a34a; padding: 18px 48px;">
                      <p style="margin:0; color:#ffffff; font-size:16px; font-weight:600;"> Account Successfully Approved</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#ffffff; padding: 48px;">
                      <h2 style="margin:0 0 24px; color:#0b2c4a; font-size:26px; font-weight:700;">Hello, ${name} </h2>
                      <p style="margin:0 0 20px; color:#475569; font-size:15px; line-height:1.8;">
                        Your account has been <strong style="color:#16a34a;">approved</strong> by the administrator.
                        You now have full access to the DEE Piping System Meeting Room Booking Platform.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                        <tr>
                          <td align="center">
                            <a href="http://192.168.0.131:802"
                               style="display:inline-block; background:#0b2c4a; color:#ffffff; 
                                      padding:16px 48px; border-radius:8px; font-size:15px; 
                                      font-weight:600; text-decoration:none;">
                              Login to DEE Piping System →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">
                        This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0b2c4a; padding:24px 48px; border-radius:0 0 8px 8px;">
                      <p style="margin:0; color:#0EA5E9; font-size:13px; font-weight:600;">DEE PIPING SYSTEM</p>
                      <p style="margin:4px 0 0; color:rgba(255,255,255,0.3); font-size:11px;">Inhouse Meeting Room Booking Platform</p>
                    </td>
                  </tr>
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

// ✅ 2. Notify admin when a user books a meeting
export const sendBookingNotificationToAdmin = async (
  adminEmail: string,
  userName: string,
  userEmail: string,
  roomName: string,
  title: string,
  startTime: Date,
  endTime: Date
) => {
  try {
    const dateStr = startTime.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' });
    const fromTime = startTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    const tillTime = endTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });

    const mailOptions = {
      from: `"DEE Piping System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Meeting Booking Request - ${userName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0; padding:0; background-color:#f0f4f8; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
                  <tr>
                    <td style="background: linear-gradient(90deg, #0EA5E9, #0b2c4a); height: 5px; border-radius: 8px 8px 0 0;"></td>
                  </tr>
                  <tr>
                    <td style="background: #0b2c4a; padding: 36px 48px;">
                      <p style="margin:0; color:#0EA5E9; font-size:20px; font-weight:700; letter-spacing:2px;">DEE PIPING SYSTEM</p>
                      <p style="margin:6px 0 0; color:rgba(255,255,255,0.45); font-size:12px;">INHOUSE MEETING ROOM BOOKING PLATFORM</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f59e0b; padding: 18px 48px;">
                      <p style="margin:0; color:#ffffff; font-size:16px; font-weight:600;">📅 New Meeting Booking Request</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#ffffff; padding: 48px;">
                      <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.8;">
                        A new meeting room booking request has been submitted and requires your approval.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:32px;">
                        <tr>
                          <td style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0;">
                            <p style="margin:0; color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Booking Details</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Booked By</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${userName} (${userEmail})</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Purpose</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${title}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Room</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${roomName}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Date</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${dateStr}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color:#64748b; font-size:13px;">Time</span>
                                </td>
                                <td align="right" style="padding: 8px 0;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${fromTime} – ${tillTime}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                        <tr>
                          <td align="center">
                            <a href="http://192.168.0.131:802"
                               style="display:inline-block; background:#0b2c4a; color:#ffffff; 
                                      padding:16px 48px; border-radius:8px; font-size:15px; 
                                      font-weight:600; text-decoration:none;">
                              Go to Admin Panel →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">
                        This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0b2c4a; padding:24px 48px; border-radius:0 0 8px 8px;">
                      <p style="margin:0; color:#0EA5E9; font-size:13px; font-weight:600;">DEE PIPING SYSTEM</p>
                      <p style="margin:4px 0 0; color:rgba(255,255,255,0.3); font-size:11px;">Inhouse Meeting Room Booking Platform</p>
                    </td>
                  </tr>
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
    console.log(`✅ Booking notification sent to admin`);
  } catch (error) {
    console.error("❌ Failed to send booking notification:", error);
  }
};

// ✅ 3. Notify user when meeting is approved
export const sendMeetingApprovedEmail = async (
  email: string,
  name: string,
  roomName: string,
  title: string,
  startTime: Date,
  endTime: Date
) => {
  try {
    const dateStr = startTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const fromTime = startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const tillTime = endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const mailOptions = {
      from: `"DEE Piping System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Meeting Room Booking Has Been Approved - DEE Piping System",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0; padding:0; background-color:#f0f4f8; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
                  <tr>
                    <td style="background: linear-gradient(90deg, #0EA5E9, #0b2c4a); height: 5px; border-radius: 8px 8px 0 0;"></td>
                  </tr>
                  <tr>
                    <td style="background: #0b2c4a; padding: 36px 48px;">
                      <p style="margin:0; color:#0EA5E9; font-size:20px; font-weight:700; letter-spacing:2px;">DEE PIPING SYSTEM</p>
                      <p style="margin:6px 0 0; color:rgba(255,255,255,0.45); font-size:12px;">INHOUSE MEETING ROOM BOOKING PLATFORM</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#16a34a; padding: 18px 48px;">
                      <p style="margin:0; color:#ffffff; font-size:16px; font-weight:600;"> Meeting Booking Approved</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#ffffff; padding: 48px;">
                      <h2 style="margin:0 0 24px; color:#0b2c4a; font-size:26px; font-weight:700;">Hello, ${name} </h2>
                      <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.8;">
                        Your meeting room booking has been <strong style="color:#16a34a;">approved</strong> by the administrator.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:32px;">
                        <tr>
                          <td style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0;">
                            <p style="margin:0; color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Booking Details</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Purpose</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${title}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Room</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${roomName}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Date</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${dateStr}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color:#64748b; font-size:13px;">Time</span>
                                </td>
                                <td align="right" style="padding: 8px 0;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${fromTime} – ${tillTime}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                        <tr>
                          <td align="center">
                            <a href="http://192.168.0.131:802"
                               style="display:inline-block; background:#0b2c4a; color:#ffffff; 
                                      padding:16px 48px; border-radius:8px; font-size:15px; 
                                      font-weight:600; text-decoration:none;">
                              View My Bookings →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">
                        This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0b2c4a; padding:24px 48px; border-radius:0 0 8px 8px;">
                      <p style="margin:0; color:#0EA5E9; font-size:13px; font-weight:600;">DEE PIPING SYSTEM</p>
                      <p style="margin:4px 0 0; color:rgba(255,255,255,0.3); font-size:11px;">Inhouse Meeting Room Booking Platform</p>
                    </td>
                  </tr>
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
    console.log(`✅ Meeting approved email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send meeting approved email:", error);
  }
};

// ✅ 4. Notify user when meeting is rejected
export const sendMeetingRejectedEmail = async (
  email: string,
  name: string,
  roomName: string,
  title: string,
  startTime: Date,
  endTime: Date
) => {
  try {
    const dateStr = startTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const fromTime = startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const tillTime = endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const mailOptions = {
      from: `"DEE Piping System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Meeting Room Booking Has Been Rejected - DEE Piping System",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0; padding:0; background-color:#f0f4f8; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
                  <tr>
                    <td style="background: linear-gradient(90deg, #0EA5E9, #0b2c4a); height: 5px; border-radius: 8px 8px 0 0;"></td>
                  </tr>
                  <tr>
                    <td style="background: #0b2c4a; padding: 36px 48px;">
                      <p style="margin:0; color:#0EA5E9; font-size:20px; font-weight:700; letter-spacing:2px;">DEE PIPING SYSTEM</p>
                      <p style="margin:6px 0 0; color:rgba(255,255,255,0.45); font-size:12px;">INHOUSE MEETING ROOM BOOKING PLATFORM</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#dc2626; padding: 18px 48px;">
                      <p style="margin:0; color:#ffffff; font-size:16px; font-weight:600;"> Meeting Booking Rejected</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#ffffff; padding: 48px;">
                      <h2 style="margin:0 0 24px; color:#0b2c4a; font-size:26px; font-weight:700;">Hello, ${name} </h2>
                      <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.8;">
                        Unfortunately, your meeting room booking has been <strong style="color:#dc2626;">rejected</strong> by the administrator.
                        Please contact the admin for more information or try booking a different time slot.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:32px;">
                        <tr>
                          <td style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0;">
                            <p style="margin:0; color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Booking Details</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Purpose</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${title}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Room</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${roomName}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#64748b; font-size:13px;">Date</span>
                                </td>
                                <td align="right" style="padding: 8px 0; border-bottom:1px solid #f1f5f9;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${dateStr}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color:#64748b; font-size:13px;">Time</span>
                                </td>
                                <td align="right" style="padding: 8px 0;">
                                  <span style="color:#0f172a; font-size:13px; font-weight:600;">${fromTime} – ${tillTime}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                        <tr>
                          <td align="center">
                            <a href="http://192.168.0.131:802"
                               style="display:inline-block; background:#0b2c4a; color:#ffffff; 
                                      padding:16px 48px; border-radius:8px; font-size:15px; 
                                      font-weight:600; text-decoration:none;">
                              Book Another Slot →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">
                        This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0b2c4a; padding:24px 48px; border-radius:0 0 8px 8px;">
                      <p style="margin:0; color:#0EA5E9; font-size:13px; font-weight:600;">DEE PIPING SYSTEM</p>
                      <p style="margin:4px 0 0; color:rgba(255,255,255,0.3); font-size:11px;">Inhouse Meeting Room Booking Platform</p>
                    </td>
                  </tr>
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
    console.log(`✅ Meeting rejected email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send meeting rejected email:", error);
  }
};