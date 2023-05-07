require('dotenv').config();
const nodemailer = require('nodemailer');

const {META_PASSWORD, META_USER} = process.env;

const nodemailerConfig = {
  host: 'smtp.meta.ua',
  port: 465,
  secure: true,
  auth: {
    user: META_USER,
    pass: META_PASSWORD
  }
};

const transporter = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async(data) => {
  const mail = {...data, from: META_USER };
  console.log('mail in sendEmail', mail);
  try {
    await transporter.sendMail(mail);
    return true
  } catch (error) {
    return error
  }
};

module.exports = sendEmail;
