import nodemailer from "nodemailer";
import { appendOrderToSheet } from "./google-sheets";

// Create reusable transporter using Gmail SMTP
let transporter: any = null;
let transporterInitialized = false;

// In Replit, we need to delay loading secrets from the runtime
async function loadSecretsFromReplit() {
  try {
    const secrets = {
      smtpHost: process.env.SMTP_HOST || "pro.eu.turbo-smtp.com",
      smtpPort: parseInt(process.env.SMTP_PORT || "587"),
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
    };

    console.log("📧 Mail service initializing - credentials status:");
    console.log("   SMTP_HOST:", secrets.smtpHost ? "✅" : "❌");
    console.log("   SMTP_USER:", secrets.smtpUser ? "✅" : "❌");

    return secrets;
  } catch (e) {
    console.error("Error loading secrets:", e);
    return { smtpHost: "pro.eu.turbo-smtp.com", smtpPort: 587, smtpUser: undefined, smtpPass: undefined };
  }
}

async function getTransporter() {
  if (transporterInitialized) {
    return transporter;
  }

    const { smtpHost, smtpPort, smtpUser, smtpPass } = await loadSecretsFromReplit();

    if (!smtpUser || !smtpPass) {
      console.warn("⚠️ SMTP credentials not configured. Using Google Sheets for logging.");
      transporterInitialized = true;
      return null;
    }

    try {
      console.log(`📧 Attempting to connect to SMTP: ${smtpHost}:${smtpPort} with user ${smtpUser}`);
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // SSL for 465, STARTTLS for others
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        debug: true,
        logger: true,
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 20000
      });
      
      await transporter.verify();
      console.log("✅ SMTP transporter verified and ready");
      transporterInitialized = true;
    } catch (error: any) {
      console.error("❌ SMTP Verification Error Details:", {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        stack: error.stack
      });
      // Don't set initialized to true on error so we can retry on next request
      return null;
    }

  return transporter;
}

/**
 * Sends an email notification for an order
 */
export async function sendOrderNotificationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  orderStatus: string,
  orderTotal: number,
  originalOrder?: any
) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.warn("⚠️ SMTP transporter not available. Order notification skipped.");
    return false;
  }

  try {
    const statusAr =
      orderStatus === "completed"
        ? "مكتمل"
        : orderStatus === "preparing" || orderStatus === "in_progress"
          ? "قيد التحضير"
          : orderStatus === "ready"
            ? "جاهز"
            : orderStatus === "cancelled"
              ? "ملغي"
              : "قيد المعالجة";

    // Get status color based on status
    const statusColor = 
      orderStatus === "completed" ? "#4CAF50" :
      orderStatus === "ready" ? "#2196F3" :
      orderStatus === "in_progress" || orderStatus === "preparing" ? "#FF9800" :
      orderStatus === "cancelled" ? "#f44336" :
      "#9C27B0";

    const statusEmoji = 
      orderStatus === "completed" ? "✅" :
      orderStatus === "ready" ? "🎯" :
      orderStatus === "in_progress" || orderStatus === "preparing" ? "👨‍🍳" :
      orderStatus === "cancelled" ? "❌" :
      "⏳";

    const mailOptions = {
      from: '"CLUNY CAFE" <cluny.cafe2026@gmail.com>',
      replyTo: "cluny.cafe2026@gmail.com",
      to: customerEmail,
      subject: `تحديث طلبك - ${orderId}`,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Mailer': 'CLUNY CAFE Order System v1.0'
      },
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f7fa; }
            .email-container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #8B5A2B 0%, #A67C52 100%); padding: 40px 30px; text-align: center; }
            .logo { height: 60px; margin-bottom: 15px; }
            .brand-title { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
            .brand-tagline { color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 13px; font-weight: 400; }
            .content { padding: 40px 30px; }
            .greeting { margin-bottom: 30px; }
            .greeting-name { color: #1a1a2e; margin: 0 0 8px 0; font-size: 22px; font-weight: 600; }
            .greeting-text { color: #666; margin: 0; font-size: 15px; line-height: 1.5; }
            .status-section { text-align: center; margin: 35px 0; }
            .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 25px 35px; border-radius: 12px; min-width: 220px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .status-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; margin: 0 0 12px 0; font-weight: 600; }
            .status-value { font-size: 32px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
            .details-box { background: linear-gradient(135deg, #f8f9fa 0%, #eef2f7 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #8B5A2B; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .detail-row:last-child { margin-bottom: 0; }
            .detail-label { color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .detail-value { color: #1a1a2e; font-size: 16px; font-weight: 700; }
            .message-box { background: linear-gradient(135deg, #fff8f0 0%, #fff5eb 100%); border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center; border: 1px solid #f0dcc8; }
            .message-text { color: #5c3d2e; margin: 0; font-size: 15px; line-height: 1.6; font-weight: 500; }
            .action-text { color: #8B5A2B; font-weight: 600; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8B5A2B 0%, #A67C52 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 25px 0; transition: all 0.3s ease; }
            .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139,90,43,0.3); }
            .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e8e8e8; }
            .footer-text { color: #888; font-size: 12px; margin: 0 0 8px 0; line-height: 1.5; }
            .footer-brand { color: #1a1a2e; font-weight: 700; }
            .divider { height: 1px; background: #e8e8e8; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <img src="https://cluny-cafe.web.app/cluny-logo.png" alt="CLUNY CAFE" class="logo">
              <h1 class="brand-title">CLUNY CAFE</h1>
              <p class="brand-tagline">تجربة القهوة الفاخرة الحقيقية</p>
            </div>

            <!-- Main Content -->
            <div class="content">
              <!-- Greeting -->
              <div class="greeting">
                <h2 class="greeting-name">مرحباً ${customerName}!</h2>
                <p class="greeting-text">تم تحديث حالة طلبك. إليك التفاصيل:</p>
              </div>

              <!-- Status Badge -->
              <div class="status-section">
                <div class="status-badge">
                  <div class="status-label">حالة الطلب</div>
                  <div class="status-value">${statusAr}</div>
                </div>
              </div>

              <!-- Order Details -->
              <div class="details-box">
                <div class="detail-row">
                  <div>
                    <div class="detail-label">رقم الطلب</div>
                    <div class="detail-value">${orderId}</div>
                  </div>
                  <div>
                    <div class="detail-label">المبلغ الإجمالي</div>
                    <div class="detail-value">${orderTotal} ريال</div>
                  </div>
                </div>
              </div>

              <!-- Status Message -->
              <div class="message-box">
                <p class="message-text">
                  ${
                    orderStatus === "completed" ? "<span class='action-text'>شكراً لك!</span> طلبك جاهز للاستلام الآن. نتمنى أن تستمتع بقهوتك!" :
                    orderStatus === "ready" ? "<span class='action-text'>تمام!</span> طلبك أصبح جاهزاً. تفضل للاستلام من الفرع." :
                    orderStatus === "in_progress" || orderStatus === "preparing" ? "<span class='action-text'>قيد الإعداد</span> فريقنا يحضر طلبك الآن بأفضل طريقة." :
                    orderStatus === "cancelled" ? "<span class='action-text'>تم الإلغاء</span> - إذا كان لديك أي استفسار، تواصل معنا." :
                    "<span class='action-text'>قيد المعالجة</span> - سيتم تحديثك قريباً عن حالة طلبك."
                  }
                </p>
              </div>

              ${
                orderStatus === "ready" 
                  ? `<center><a href="#" class="cta-button">اذهب إلى الفرع</a></center>`
                  : ''
              }
            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                <span class="footer-brand">CLUNY CAFE</span> - نحن نقدم أفضل تجربة قهوة
              </p>
              <p class="footer-text">
                هذا البريد مرسل تلقائياً. يرجى عدم الرد عليه مباشرة.
              </p>
              <p class="footer-text" style="margin-top: 12px; font-size: 11px; opacity: 0.7;">
                © 2025 CLUNY CAFE. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [TURBOSMTP] Mail sent successfully to ${customerEmail}. MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ [TURBOSMTP] Detailed Send Error:", error);
    return false;
  }
}

export async function sendReferralEmail(
  customerEmail: string,
  customerName: string,
  referralCode: string
) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.log("📧 Email service not configured. Skipping email.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"CLUNY CAFE" <info@qahwakup.com>`,
      to: customerEmail,
      subject: "انضم إلى برنامج الإحالات الخاص بنا",
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl;">
          <h2>مرحباً ${customerName}</h2>
          <p>شارك رمز الإحالة الخاص بك واحصل على نقاط!</p>
          <div style="background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${referralCode}</p>
          </div>
          <p>احصل على <strong>50 نقطة</strong> لكل صديق تحيله بنجاح!</p>
          <p>استخدم النقاط للحصول على خصومات وعروض حصرية.</p>
        </div>
      `,
    });

    console.log(`✅ Referral email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send referral email:", error);
    return false;
  }
}

export async function sendLoyaltyPointsEmail(
  customerEmail: string,
  customerName: string,
  pointsEarned: number,
  totalPoints: number
) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.log("📧 Email service not configured. Skipping email.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"CLUNY CAFE" <info@qahwakup.com>`,
      to: customerEmail,
      subject: "لقد حصلت على نقاط جديدة!",
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl;">
          <h2>مبروك ${customerName}!</h2>
          <p>لقد حصلت على نقاط جديدة في حسابك!</p>
          <div style="background-color: #FFD700; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 18px;"><strong>النقاط المكتسبة:</strong> +${pointsEarned}</p>
            <p style="font-size: 18px;"><strong>إجمالي النقاط:</strong> ${totalPoints}</p>
          </div>
          <p>استخدم نقاطك للحصول على خصومات رائعة!</p>
        </div>
      `,
    });

    console.log(`✅ Loyalty email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send loyalty email:", error);
    return false;
  }
}

export async function sendPromotionEmail(
  customerEmail: string,
  customerName: string,
  promotionTitle: string,
  promotionDescription: string,
  discountCode?: string
) {
  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"CLUNY CAFE" <info@qahwakup.com>`,
      to: customerEmail,
      subject: promotionTitle,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
          <h2 style="color: #8B5A2B;">مرحباً ${customerName}</h2>
          <p>${promotionDescription}</p>
          ${discountCode ? `
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <p>استخدم رمز الخصم هذا:</p>
              <p style="font-size: 24px; font-weight: bold; color: #8B5A2B; margin: 0;">${discountCode}</p>
            </div>
          ` : ''}
          <p>نتمنى لك يوماً سعيداً!</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("❌ Failed to send promotion email:", error);
    return false;
  }
}

export async function sendReservationConfirmationEmail(
  customerEmail: string,
  customerName: string,
  tableNumber: string,
  reservationDate: string,
  reservationTime: string,
  numberOfGuests: number,
  expiryTime: string
) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.log("📧 Email service not configured. Skipping email.");
    return false;
  }

  try {
    const senderEmail = process.env.SMTP_FROM || "CLUNY CAFE <ma3k.2025@gmail.com>";
    const formattedDate = new Date(reservationDate).toLocaleDateString('ar');
    await transporter.sendMail({
      from: senderEmail,
      to: customerEmail,
      subject: `تأكيد حجزك - طاولة ${tableNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #8B5A2B;">مرحباً ${customerName}</h2>
          <p>تم تأكيد حجزك في CLUNY CAFE!</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 5px solid #8B5A2B;">
            <p><strong>رقم الطاولة:</strong> ${tableNumber}</p>
            <p><strong>التاريخ:</strong> ${formattedDate}</p>
            <p><strong>الوقت:</strong> ${reservationTime}</p>
            <p><strong>عدد الضيوف:</strong> ${numberOfGuests}</p>
            <p style="color: #FF6B6B;"><strong>ينتهي الحجز في:</strong> ${new Date(expiryTime).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <p style="color: #666; font-size: 14px;">
            <strong>ملاحظة مهمة:</strong> الطاولة محجوزة لمدة ساعة واحدة. إذا كنت بحاجة إلى المزيد من الوقت، يمكنك تمديد الحجز مرة واحدة من تطبيقنا.
          </p>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">شكراً لاختيارك CLUNY CAFE!</p>
        </div>
      `,
    });

    console.log(`✅ Reservation confirmation email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send reservation email:", error);
    return false;
  }
}

export async function sendReservationExpiryWarningEmail(
  customerEmail: string,
  customerName: string,
  tableNumber: string,
  expiryTime: string
) {
  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    const senderEmail = process.env.SMTP_FROM || "CLUNY CAFE <ma3k.2025@gmail.com>";
    const expiryTimeFormatted = new Date(expiryTime).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
    await transporter.sendMail({
      from: senderEmail,
      to: customerEmail,
      subject: `⏰ تذكير: حجزك سينتهي بعد 15 دقيقة`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px; border: 2px solid #FF6B6B; border-radius: 10px;">
          <h2 style="color: #FF6B6B;">تنبيه!</h2>
          <p>مرحباً ${customerName}</p>
          
          <div style="background-color: #FFE5E5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>حجزك في الطاولة رقم ${tableNumber}</strong> سينتهي في:</p>
            <p style="font-size: 24px; color: #FF6B6B; font-weight: bold; margin: 10px 0;">${expiryTimeFormatted}</p>
          </div>

          <p style="color: #333;">إذا كنت بحاجة إلى المزيد من الوقت، يمكنك <strong>تمديد الحجز لساعة إضافية</strong> من التطبيق الآن!</p>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">هذا البريد مرسل تلقائياً، يرجى عدم الرد.</p>
        </div>
      `,
    });

    console.log(`✅ Reservation expiry warning email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send expiry warning email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(customerEmail: string, customerName: string) {
  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"CLUNY CAFE" <info@qahwakup.com>`,
      to: customerEmail,
      subject: "أهلاً بك في CLUNY CAFE! ☕",
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
          <h2 style="color: #8B5A2B;">مرحباً ${customerName}</h2>
          <p>يسعدنا انضمامك إلينا في عائلة CLUNY CAFE.</p>
          <p>يمكنك الآن البدء في طلب قهوتك المفضلة وجمع النقاط مع كل طلب!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
             <p>استخدم تطبيقنا لتجربة أسرع وأسهل.</p>
          </div>
          <p>نتطلع لخدمتك قريباً!</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return false;
  }
}

export async function sendAbandonedCartEmail(customerEmail: string, customerName: string) {
  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"CLUNY CAFE" <info@qahwakup.com>`,
      to: customerEmail,
      subject: "نسيت شيئاً في عربتك؟ 🛒",
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
          <h2 style="color: #8B5A2B;">مرحباً ${customerName}</h2>
          <p>لاحظنا أنك تركت بعض الأصناف الرائعة في عربة التسوق الخاصة بك.</p>
          <p>لا تدع قهوتك تبرد! عد الآن وأكمل طلبك قبل نفاد الكمية.</p>
          <div style="margin: 20px 0;">
            <a href="https://qahwakup.com/checkout" style="background-color: #8B5A2B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">أكمل الطلب الآن</a>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("❌ Failed to send abandoned cart email:", error);
    return false;
  }
}

// Global interval to check for abandoned carts (simulated)
// In a real production app, this would be a cron job or a more robust queue
setInterval(async () => {
  try {
    const { CartItemModel, CustomerModel } = await import("@shared/schema");
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Find sessions that haven't been touched in 1 hour but are less than 2 hours old
    // This is a simplified check for "abandoned"
    const abandonedCarts = await CartItemModel.find({
      createdAt: { $gte: twoHoursAgo, $lte: oneHourAgo }
    }).distinct('sessionId');

    // For this example, we'll just log. In a real app, you'd link sessionId to a Customer
    // and send the email if they haven't ordered.
    if (abandonedCarts.length > 0) {
      console.log(`🔍 Found ${abandonedCarts.length} potentially abandoned carts`);
    }
  } catch (err) {
    console.error("Abandoned Cart Check Error:", err);
  }
}, 30 * 60 * 1000); // Check every 30 minutes

export async function testEmailConnection() {
  const transporter = await getTransporter();
  if (!transporter) {
    console.log("⚠️ Email service not configured");
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ Email service connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Email service connection failed:", error);
    return false;
  }
}
