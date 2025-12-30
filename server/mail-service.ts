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

    // TurboSMTP Re-envelope: Send from TurboSMTP while showing notification email
    // The actual sending happens through TurboSMTP (pro.eu.turbo-smtp.com)
    // but the "From" address shows the notification email
    const notificationEmail = process.env.NOTIFICATION_EMAIL || "cluny.cafe2026@gmail.com";
    const senderEmail = `CLUNY CAFE <${notificationEmail}>`;
    
    const mailOptions = {
      from: senderEmail,
      to: customerEmail,
      subject: `تحديث طلبك - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #8B5A2B;">مرحباً ${customerName}</h2>
          <p>تم تحديث حالة طلبك!</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 5px solid #8B5A2B;">
            <p><strong>رقم الطلب:</strong> ${orderId}</p>
            <p><strong>الحالة:</strong> ${statusAr}</p>
            <p><strong>المبلغ:</strong> ${orderTotal} ريال</p>
          </div>
          <p>شكراً لاختيارك CLUNY CAFE!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">هذا البريد مرسل تلقائياً، يرجى عدم الرد.</p>
        </div>
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
