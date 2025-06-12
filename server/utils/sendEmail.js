const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Tạo transporter với Gmail (bạn có thể thay đổi theo nhà cung cấp email của mình)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Cấu hình email
    const mailOptions = {
      from: `VietTrad <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    // Gửi email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail; 