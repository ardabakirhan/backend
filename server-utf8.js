// ...existing code...
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Email transporter configuration with UTF-8 support
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'webmail.iletisimgroup.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true,
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
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://92.249.61.10:8000',
    'http://92.249.61.10',
    '92.249.61.10',
    '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

// UTF-8 encoding middleware
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  type: 'application/x-www-form-urlencoded'
}));

// Set UTF-8 charset for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

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
    
    // Send email notification with UTF-8 support
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'info@iletisimgroup.com',
        to: process.env.ADMIN_EMAIL || 'info@iletisimgroup.com',
        subject: `🔔 Yeni İletişim Formu: ${subject || 'Genel Bilgi'}`,
        html: `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>İletişim Group - Yeni Mesaj</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 300;">İletişim Group</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Yeni İletişim Formu Mesajı</p>
                  </div>
                  
                  <div style="padding: 40px 30px;">
                      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                          <p style="margin: 0; color: #1976d2; font-weight: 500; font-size: 16px;">📧 Yeni bir iletişim formu mesajı aldınız</p>
                      </div>
                      
                      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                          <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">👤 Gönderen Bilgileri</h2>
                          
                          <table style="width: 100%; border-collapse: collapse;">
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e; width: 120px;">Ad Soyad:</td>
                                  <td style="padding: 8px 0; color: #2c3e50;">${name}</td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e;">E-posta:</td>
                                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3498db; text-decoration: none; font-weight: 500;">${email}</a></td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Şirket:</td>
                                  <td style="padding: 8px 0; color: #2c3e50;">${company || 'Belirtilmemiş'}</td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Konu:</td>
                                  <td style="padding: 8px 0; color: #2c3e50;">
                                      <span style="background-color: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${subject || 'Genel Bilgi'}</span>
                                  </td>
                              </tr>
                          </table>
                      </div>
                      
                      <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                          <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">💬 Mesaj İçeriği</h2>
                          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #3498db;">
                              <p style="margin: 0; color: #2c3e50; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${message}</p>
                          </div>
                      </div>
                      
                      <div style="text-align: center; margin: 30px 0;">
                          <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; margin: 0 10px;">📧 Hemen Yanıtla</a>
                          <a href="tel:05498560018" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; margin: 0 10px;">📞 Ara</a>
                      </div>
                      
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
                          <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
                              <strong>📅 Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Europe/Istanbul'
                              })}
                          </p>
                      </div>
                  </div>
                  
                  <div style="background-color: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">İletişim Group</h3>
                      <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">Karaman Mah. İzmir Yolu Cd. No:30 Nilüfer/BURSA</p>
                      <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.8;">📞 0 549 856 00 18 | 📧 info@iletisimgroup.com</p>
                      <div style="border-top: 1px solid #34495e; padding-top: 15px; margin-top: 15px;">
                          <p style="margin: 0; font-size: 12px; opacity: 0.7;">Bu mesaj İletişim Group web sitesi iletişim formu aracılığıyla gönderilmiştir.</p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to admin');
      
      // Send confirmation email to user
      const confirmationMail = {
        from: process.env.EMAIL_USER || 'info@iletisimgroup.com',
        to: email,
        subject: '✅ Mesajınız Alındı - İletişim Group',
        html: `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>İletişim Group - Mesaj Onayı</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 300;">İletişim Group</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Mesajınız Başarıyla Alındı</p>
                  </div>
                  
                  <div style="padding: 40px 30px;">
                      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: center;">
                          <h2 style="margin: 0 0 10px 0; color: #155724; font-size: 24px; font-weight: 600;">✅ Teşekkürler ${name}!</h2>
                          <p style="margin: 0; color: #155724; font-size: 16px;">Mesajınız başarıyla alınmıştır</p>
                      </div>
                      
                      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">📄 Mesaj Detaylarınız</h3>
                          
                          <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e9ecef;">
                              <table style="width: 100%; border-collapse: collapse;">
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: 600; color: #34495e; width: 120px;">Konu:</td>
                                      <td style="padding: 8px 0; color: #2c3e50;">
                                          <span style="background-color: #3498db; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${subject || 'Genel Bilgi'}</span>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Tarih:</td>
                                      <td style="padding: 8px 0; color: #2c3e50;">
                                          ${new Date().toLocaleString('tr-TR', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              timeZone: 'Europe/Istanbul'
                                          })}
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: 600; color: #34495e;">E-posta:</td>
                                      <td style="padding: 8px 0; color: #2c3e50;">${email}</td>
                                  </tr>
                              </table>
                          </div>
                      </div>
                      
                      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px; font-weight: 600;">⏰ Sıradaki Adımlar</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #856404;">
                              <li style="margin-bottom: 8px;">Mesajınız ekibimiz tarafından incelenecektir</li>
                              <li style="margin-bottom: 8px;">En kısa sürede size dönüş yapılacaktır</li>
                              <li style="margin-bottom: 8px;">Yanıt için bu email adresini kontrol ediniz: <strong>${email}</strong></li>
                          </ul>
                      </div>
                      
                      <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 15px 0; color: #1976d2; font-size: 18px; font-weight: 600;">🚨 Acil Durum İletişim</h3>
                          <p style="margin: 0 0 10px 0; color: #1976d2; font-size: 14px;">Acil durumlar için aşağıdaki iletişim bilgilerini kullanabilirsiniz:</p>
                          <div style="text-align: center; margin-top: 15px;">
                              <a href="tel:05498560018" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; margin: 5px;">📞 0 549 856 00 18</a>
                              <a href="mailto:info@iletisimgroup.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; margin: 5px;">📧 Email Gönder</a>
                          </div>
                      </div>
                  </div>
                  
                  <div style="background-color: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">İletişim Group</h3>
                      <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">Karaman Mah. İzmir Yolu Cd. No:30 Nilüfer/BURSA</p>
                      <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.8;">📞 0 549 856 00 18 | 📧 info@iletisimgroup.com</p>
                      <div style="border-top: 1px solid #34495e; padding-top: 15px; margin-top: 15px;">
                          <p style="margin: 0; font-size: 12px; opacity: 0.7;">Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `
      };
      
      await transporter.sendMail(confirmationMail);
      console.log('✅ Confirmation email sent to user');
      
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: {
        id: Date.now(),
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
app.post('/api/newsletter', async (req, res) => {
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

// Sector form endpoint (for specialized forms with phone numbers)
app.post('/api/sector-form', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message, sector } = req.body;
    
    // Basic validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Ad, e-posta, telefon ve mesaj alanları zorunludur.'
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
    
    // Phone validation (Turkish format)
    const phoneRegex = /^(\+90|0)?[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir telefon numarası giriniz.'
      });
    }
    
    // Log the sector form submission
    console.log('🏢 New sector form submission:', {
      name,
      email,
      phone,
      company,
      subject,
      message,
      sector,
      timestamp: new Date().toISOString()
    });
    
    // Send email notification
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'contact@iletisimgroup.com',
        to: process.env.ADMIN_EMAIL || 'info@iletisimgroup.com',
        subject: `🏢 Yeni Sektörel Form: ${sector || subject || 'Danışmanlık Talebi'}`,
        html: `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>İletişim Group - Yeni Sektörel Form</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 300;">İletişim Group</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Yeni Sektörel Danışmanlık Talebi</p>
                  </div>
                  
                  <div style="padding: 40px 30px;">
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
                          <p style="margin: 0; color: #856404; font-weight: 500; font-size: 16px;">🏢 Yeni bir sektörel danışmanlık talebi aldınız</p>
                      </div>
                      
                      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                          <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">👤 Talep Eden Bilgileri</h2>
                          
                          <table style="width: 100%; border-collapse: collapse;">
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e; width: 120px;">Ad Soyad:</td>
                                  <td style="padding: 8px 0; color: #2c3e50;">${name}</td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e;">E-posta:</td>
                                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3498db; text-decoration: none; font-weight: 500;">${email}</a></td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Telefon:</td>
                                  <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #27ae60; text-decoration: none; font-weight: 500;">${phone}</a></td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Şirket:</td>
                                  <td style="padding: 8px 0; color: #2c3e50;">${company || 'Belirtilmemiş'}</td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Sektör:</td>
                                  <td style="padding: 8px 0; color: #2c3e50;">
                                      <span style="background-color: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${sector || 'Genel'}</span>
                                  </td>
                              </tr>
                              <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Konu:</td>
                                  <td style="padding: 8px 0; color: #2c3e50;">
                                      <span style="background-color: #ffc107; color: #212529; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${subject || 'Danışmanlık Talebi'}</span>
                                  </td>
                              </tr>
                          </table>
                      </div>
                      
                      <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                          <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">💬 Talep Detayı</h2>
                          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #ff6b6b;">
                              <p style="margin: 0; color: #2c3e50; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${message}</p>
                          </div>
                      </div>
                      
                      <div style="text-align: center; margin: 30px 0;">
                          <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; margin: 0 10px;">📧 Email İle Yanıtla</a>
                          <a href="tel:${phone}" style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; margin: 0 10px;">📞 Telefon Et</a>
                      </div>
                      
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
                          <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
                              <strong>📅 Talep Zamanı:</strong> ${new Date().toLocaleString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Europe/Istanbul'
                              })}
                          </p>
                      </div>
                  </div>
                  
                  <div style="background-color: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">İletişim Group</h3>
                      <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">Karaman Mah. İzmir Yolu Cd. No:30 Nilüfer/BURSA</p>
                      <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.8;">📞 0 549 856 00 18 | 📧 contact@iletisimgroup.com</p>
                      <div style="border-top: 1px solid #34495e; padding-top: 15px; margin-top: 15px;">
                          <p style="margin: 0; font-size: 12px; opacity: 0.7;">Bu mesaj İletişim Group sektörel danışmanlık formu aracılığıyla gönderilmiştir.</p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('✅ Sector form email sent successfully to admin');
      
      // Send confirmation email to user
      const confirmationMail = {
        from: process.env.EMAIL_USER || 'contact@iletisimgroup.com',
        to: email,
        subject: `✅ ${sector || 'Danışmanlık'} Talebiniz Alındı - İletişim Group`,
        html: `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>İletişim Group - Talep Onayı</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 300;">İletişim Group</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Talebiniz Başarıyla Alındı</p>
                  </div>
                  
                  <div style="padding: 40px 30px;">
                      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: center;">
                          <h2 style="margin: 0 0 10px 0; color: #155724; font-size: 24px; font-weight: 600;">✅ Teşekkürler ${name}!</h2>
                          <p style="margin: 0; color: #155724; font-size: 16px;">Sektörel danışmanlık talebiniz başarıyla alınmıştır</p>
                      </div>
                      
                      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">📋 Talep Detaylarınız</h3>
                          
                          <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e9ecef;">
                              <table style="width: 100%; border-collapse: collapse;">
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: 600; color: #34495e; width: 120px;">Sektör:</td>
                                      <td style="padding: 8px 0; color: #2c3e50;">
                                          <span style="background-color: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${sector || 'Genel'}</span>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Konu:</td>
                                      <td style="padding: 8px 0; color: #2c3e50;">
                                          <span style="background-color: #ffc107; color: #212529; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${subject || 'Danışmanlık Talebi'}</span>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: 600; color: #34495e;">Tarih:</td>
                                      <td style="padding: 8px 0; color: #2c3e50;">
                                          ${new Date().toLocaleString('tr-TR', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              timeZone: 'Europe/Istanbul'
                                          })}
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 8px 0; font-weight: 600; color: #34495e;">İletişim:</td>
                                      <td style="padding: 8px 0; color: #2c3e50;">${email} | ${phone}</td>
                                  </tr>
                              </table>
                          </div>
                      </div>
                      
                      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px; font-weight: 600;">⏰ Süreç Bilgisi</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #856404;">
                              <li style="margin-bottom: 8px;">Uzman ekibimiz talebinizi değerlendirmektedir</li>
                              <li style="margin-bottom: 8px;">24 saat içinde size dönüş yapılacaktır</li>
                              <li style="margin-bottom: 8px;">Telefon numaranıza da ulaşım sağlanabilir</li>
                              <li style="margin-bottom: 8px;">Acil durumlar için: <strong>0 549 856 00 18</strong></li>
                          </ul>
                      </div>
                      
                      <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 15px 0; color: #1976d2; font-size: 18px; font-weight: 600;">💼 Sektörel Uzmanlarımız</h3>
                          <p style="margin: 0 0 10px 0; color: #1976d2; font-size: 14px;">
                              ${sector || 'Genel'} sektöründe deneyimli uzman ekibimiz talebinizi değerlendirmektedir. Size özel çözümler sunmak için sabırsızlanıyoruz.
                          </p>
                      </div>
                  </div>
                  
                  <div style="background-color: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">İletişim Group</h3>
                      <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.8;">Karaman Mah. İzmir Yolu Cd. No:30 Nilüfer/BURSA</p>
                      <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.8;">📞 0 549 856 00 18 | 📧 contact@iletisimgroup.com</p>
                      <div style="border-top: 1px solid #34495e; padding-top: 15px; margin-top: 15px;">
                          <p style="margin: 0; font-size: 12px; opacity: 0.7;">Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `
      };
      
      await transporter.sendMail(confirmationMail);
      console.log('✅ Sector form confirmation email sent to user');
      
    } catch (emailError) {
      console.error('❌ Sector form email sending error:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Sektörel danışmanlık talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sector: sector || 'Genel',
        phone: phone
      }
    });
    
  } catch (error) {
    console.error('Sector form error:', error);
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

