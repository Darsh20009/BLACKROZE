import nodemailer from "nodemailer";
import { appendOrderToSheet } from "./google-sheets";

// Create reusable transporter using Gmail SMTP
let transporter: any = null;
let transporterInitialized = false;

// Load SMTP secrets from environment (works in both Replit and Render)
async function loadSmtpSecrets() {
  try {
    const secrets = {
      smtpHost: process.env.SMTP_HOST || "pro.eu.turbo-smtp.com",
      smtpPort: parseInt(process.env.SMTP_PORT || "587"),
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      smtpApiKey: process.env.SMTP2GO_API_KEY,
    };

    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`📧 Mail service initializing [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]:`);
    console.log("   SMTP_HOST:", secrets.smtpHost ? `✅ ${secrets.smtpHost}` : "❌");
    console.log("   SMTP_PORT:", secrets.smtpPort);
    console.log("   SMTP_USER:", secrets.smtpUser ? "✅" : "❌");
    console.log("   SMTP_PASS:", secrets.smtpPass ? "✅" : "❌");

    return secrets;
  } catch (e) {
    console.error("Error loading SMTP secrets:", e);
    return { smtpHost: "pro.eu.turbo-smtp.com", smtpPort: 587, smtpUser: undefined, smtpPass: undefined };
  }
}

async function getTransporter() {
  if (transporterInitialized) {
    return transporter;
  }

  const { smtpHost, smtpPort, smtpUser, smtpPass } = await loadSmtpSecrets();

  if (!smtpUser || !smtpPass) {
    console.warn("⚠️ SMTP credentials not configured. Email service disabled.");
    console.warn("   Required environment variables: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT");
    transporterInitialized = true;
    return null;
  }

  try {
    console.log(`📧 Creating SMTP transporter for ${smtpHost}:${smtpPort}`);
    
    const transporterOptions: any = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Help with some SMTP server certificate issues
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:!aNULL:!3DES' // More secure ciphers
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 60000, // Increased for stability
      pool: true,
      maxConnections: 5, // Slightly increased
      maxMessages: 100,
      rateLimit: 5 // Added rate limiting to prevent being flagged as spam
    };

    // If using port 587, explicit starttls is often better
    if (smtpPort === 587) {
      transporterOptions.requireTLS = true;
      transporterOptions.secure = false; // Port 587 uses STARTTLS, so secure should be false
    }
    
    transporter = nodemailer.createTransport(transporterOptions);
    
    transporterInitialized = true;
    console.log("✅ SMTP transporter created (verification on first use)");
    
    transporter.verify().then(() => {
      console.log("✅ SMTP connection verified");
    }).catch((err: any) => {
      console.warn("⚠️ SMTP verification failed:", err.message);
      console.log("   Will retry on next email send...");
    });
    
  } catch (error: any) {
    console.error("❌ Error creating SMTP transporter:", error.message);
    transporterInitialized = true;
    return null;
  }

  return transporter;
}

export async function checkMailServiceHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const transport = await getTransporter();
    if (!transport) {
      return { healthy: false, message: 'SMTP credentials not configured' };
    }
    await transport.verify();
    return { healthy: true, message: 'SMTP connection verified' };
  } catch (error: any) {
    return { healthy: false, message: `SMTP error: ${error.message}` };
  }
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
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.warn("⚠️ Email service not available for order notification.");
      return false;
    }

    const senderEmail = process.env.SMTP_FROM || "noreply@cluny.cafe";
    
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
      from: senderEmail,
      to: customerEmail,
      subject: `تحديث طلبك - ${orderId}`,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Mailer': 'CLUNY CAFE',
        'List-Unsubscribe': '<mailto:noreply@cluny.cafe>',
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      },
      text: `مرحباً ${customerName}
      
تم تحديث حالة طلبك.

رقم الطلب: ${orderId}
الحالة: ${statusAr}
المبلغ: ${orderTotal} ريال

${
  orderStatus === "completed" ? "شكراً لك! طلبك جاهز للاستلام الآن." :
  orderStatus === "ready" ? "طلبك جاهز! تفضل للاستلام من الفرع." :
  orderStatus === "in_progress" || orderStatus === "preparing" ? "فريقنا يحضر طلبك الآن." :
  orderStatus === "cancelled" ? "تم إلغاء طلبك." :
  "جاري معالجة طلبك."
}

CLUNY CAFE
تجربة القهوة الفاخرة`,
      html: `
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style type="text/css">
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .wrapper { background: #f5f5f5; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; }
            .header { text-align: center; border-bottom: 2px solid #8B5A2B; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { color: #8B5A2B; font-size: 28px; margin: 10px 0; }
            .tagline { color: #666; font-size: 13px; }
            .content { margin: 20px 0; }
            .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
            .status { background: ${statusColor}; color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .status-value { font-size: 24px; font-weight: bold; }
            .details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-right: 3px solid #8B5A2B; }
            .detail-row { padding: 8px 0; }
            .detail-label { color: #888; font-size: 12px; font-weight: bold; }
            .detail-value { color: #333; font-size: 16px; font-weight: bold; }
            .message { background: #faf5f0; padding: 15px; margin: 20px 0; border-radius: 5px; color: #5c3d2e; font-size: 14px; line-height: 1.5; }
            .footer { border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>CLUNY CAFE</h1>
                <p class="tagline">تجربة القهوة الفاخرة</p>
              </div>
              
              <div class="content">
                <div class="greeting">مرحباً ${customerName}!</div>
                
                <div class="status">
                  <div style="font-size: 12px; margin-bottom: 10px;">حالة الطلب</div>
                  <div class="status-value">${statusAr}</div>
                </div>
                
                <div class="details">
                  <div class="detail-row">
                    <div class="detail-label">رقم الطلب</div>
                    <div class="detail-value">${orderId}</div>
                  </div>
                  <div class="detail-row" style="margin-top: 10px;">
                    <div class="detail-label">المبلغ الإجمالي</div>
                    <div class="detail-value">${orderTotal} ريال</div>
                  </div>
                </div>
                
                <div class="message">
                  ${
                    orderStatus === "completed" ? "شكراً لك! طلبك جاهز للاستلام الآن. نتمنى أن تستمتع بقهوتك!" :
                    orderStatus === "ready" ? "تمام! طلبك أصبح جاهزاً. تفضل للاستلام من الفرع." :
                    orderStatus === "in_progress" || orderStatus === "preparing" ? "قيد الإعداد - فريقنا يحضر طلبك الآن بعناية." :
                    orderStatus === "cancelled" ? "تم إلغاء طلبك. إذا كان لديك أي استفسار، تواصل معنا." :
                    "قيد المعالجة - سيتم تحديثك قريباً."
                  }
                </div>
              </div>
              
              <div class="footer">
                <p>© 2025 CLUNY CAFE - جميع الحقوق محفوظة</p>
                <p>هذا البريد مرسل تلقائياً. يرجى عدم الرد.</p>
              </div>
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
      from: `"CLUNY CAFE" <${process.env.SMTP_FROM || "noreply@cluny.cafe"}>`,
      to: customerEmail,
      subject: "انضم إلى برنامج الإحالات الخاص بنا",
      headers: {
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      },
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
      from: `"CLUNY CAFE" <${process.env.SMTP_FROM || "noreply@cluny.cafe"}>`,
      to: customerEmail,
      subject: "لقد حصلت على نقاط جديدة!",
      headers: {
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      },
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
  subject: string,
  promotionDescription: string,
  discountCode?: string
) {
  const transporter = await getTransporter();
  if (!transporter) return false;

  try {
    const senderEmail = process.env.SMTP_FROM || "noreply@cluny.cafe";
    const mailOptions = {
      from: senderEmail,
      to: customerEmail,
      subject: subject,
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
          <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #888;">
            تم الإرسال بواسطة نظام CLUNY CAFE
          </div>
        </div>
      `,
      headers: {
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      }
    };

    await transporter.sendMail(mailOptions);
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
    const senderEmail = process.env.SMTP_FROM || "noreply@cluny.cafe";
    const formattedDate = new Date(reservationDate).toLocaleDateString('ar');
    await transporter.sendMail({
      from: senderEmail,
      to: customerEmail,
      subject: `تأكيد حجزك - طاولة ${tableNumber}`,
      headers: {
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      },
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
    const senderEmail = process.env.SMTP_FROM || "noreply@cluny.cafe";
    const expiryTimeFormatted = new Date(expiryTime).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
    await transporter.sendMail({
      from: senderEmail,
      to: customerEmail,
      subject: `⏰ تذكير: حجزك سينتهي بعد 15 دقيقة`,
      headers: {
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      },
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
      from: `"CLUNY CAFE" <${process.env.SMTP_FROM || "noreply@cluny.cafe"}>`,
      to: customerEmail,
      subject: "أهلاً بك في CLUNY CAFE! ☕",
      headers: {
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      },
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
      from: `"CLUNY CAFE" <${process.env.SMTP_FROM || "noreply@cluny.cafe"}>`,
      to: customerEmail,
      subject: "نسيت شيئاً في عربتك؟ 🛒",
      headers: {
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      },
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
          <h2 style="color: #8B5A2B;">مرحباً ${customerName}</h2>
          <p>لاحظنا أنك تركت بعض الأصناف الرائعة في عربة التسوق الخاصة بك.</p>
          <p>لا تدع قهوتك تبرد! عد الآن وأكمل طلبك قبل نفاد الكمية.</p>
          <div style="margin: 20px 0;">
            <a href="https://cluny.ma3k.online/checkout" style="background-color: #8B5A2B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">أكمل الطلب الآن</a>
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

export async function sendPointsVerificationEmail(
  customerEmail: string,
  customerName: string,
  code: string,
  points: number,
  valueSAR: number
) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.log("[POINTS-VERIFY] Email service not configured. Code:", code);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"CLUNY CAFE" <${process.env.SMTP_FROM || "noreply@cluny.cafe"}>`,
      to: customerEmail,
      subject: "رمز تأكيد استخدام النقاط - CLUNY CAFE",
      headers: {
        'X-SMTPAPI': JSON.stringify({
          api_key: process.env.SMTP2GO_API_KEY
        })
      },
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2D9B6E; margin: 0;">CLUNY CAFE</h1>
          </div>
          <h2 style="color: #333;">مرحباً ${customerName}</h2>
          <p style="color: #555; font-size: 16px;">تم طلب استخدام نقاطك لخصم من طلب. يرجى مشاركة الرمز التالي مع الموظف:</p>
          <div style="background: linear-gradient(135deg, #2D9B6E, #1a7a50); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <p style="color: rgba(255,255,255,0.8); margin: 0 0 8px 0; font-size: 14px;">رمز التأكيد</p>
            <p style="color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 12px; margin: 0;">${code}</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0; color: #333;"><strong>النقاط المستخدمة:</strong> ${points} نقطة</p>
            <p style="margin: 5px 0; color: #333;"><strong>قيمة الخصم:</strong> ${valueSAR.toFixed(2)} ريال</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">هذا الرمز صالح لمدة 10 دقائق فقط. لا تشاركه إلا مع موظف كلوني.</p>
          <p style="color: #999; font-size: 12px;">إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>
        </div>
      `,
    });

    console.log(`[POINTS-VERIFY] Verification email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("[POINTS-VERIFY] Failed to send verification email:", error);
    return false;
  }
}

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
