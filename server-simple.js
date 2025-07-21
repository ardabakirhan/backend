const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'webmail.iletisimgroup.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'info@iletisimgroup.com',
    pass: process.env.EMAIL_PASS || 'your-password'
  },
  tls: {
    rejectUnauthorized: false
  }
});re('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.iletisimgroup.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'info@iletisimgroup.com',
    pass: process.env.EMAIL_PASS || 'your-password'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
    console.log('💡 Please check your email settings in .env file');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Middleware
app.use(cors({
  origin: '*', // Tüm domain'lere izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', cors());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'İletişim Group Backend Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Ad, e-posta ve mesaj alanları zorunludur.'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz.'
      });
    }
    
    // Log the contact form submission
    console.log('📧 New contact form submission:', {
      name,
      email,
      company,
      subject,
      message,
      timestamp: new Date().toISOString()
    });
    
    // Send email notification
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: process.env.ADMIN_EMAIL || 'a.bakirhan@outlook.com', // Admin email
        subject: `🔔 Yeni İletişim Formu: ${subject || 'Genel Bilgi'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              📧 Yeni İletişim Formu Mesajı
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">👤 Gönderen Bilgileri:</h3>
              <p><strong>Ad Soyad:</strong> ${name}</p>
              <p><strong>E-posta:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Şirket:</strong> ${company || 'Belirtilmemiş'}</p>
              <p><strong>Konu:</strong> ${subject || 'Genel Bilgi'}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">💬 Mesaj:</h3>
              <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px;">
                Bu mesaj İletişim Group web sitesi iletişim formu aracılığıyla gönderilmiştir.
              </p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to admin');
      
      // Send confirmation email to user
      const confirmationMail = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: '✅ Mesajınız Alındı - İletişim Group',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
              ✅ Mesajınız Başarıyla Alındı
            </h2>
            
            <p>Merhaba <strong>${name}</strong>,</p>
            
            <p>İletişim Group web sitesi üzerinden gönderdiğiniz mesaj başarıyla alınmıştır.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">📄 Mesaj Detayları:</h3>
              <p><strong>Konu:</strong> ${subject || 'Genel Bilgi'}</p>
              <p><strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</p>
            </div>
            
            <p>Mesajınız ekibimiz tarafından incelenecek ve en kısa sürede size dönüş yapılacaktır.</p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>💡 Not:</strong> Acil durumlar için doğrudan telefon veya WhatsApp üzerinden iletişime geçebilirsiniz.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 12px;">
                İletişim Group | www.iletisimgroup.com
              </p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(confirmationMail);
      console.log('✅ Confirmation email sent to user');
      
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // Don't fail the request if email fails
    }
    
    // In a real application, you would save this to database
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: {
        id: Date.now(), // Simple ID generation
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
});

// Newsletter subscription endpoint
app.post('/api/newsletter', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-posta adresi gereklidir.'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz.'
      });
    }
    
    console.log('📬 Newsletter subscription:', { email, timestamp: new Date().toISOString() });
    
    res.json({
      success: true,
      message: 'Newsletter aboneliğiniz başarıyla oluşturuldu.'
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Access the server at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
