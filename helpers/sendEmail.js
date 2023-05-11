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

const sendEmail = (data) => {
  const mail = { from: META_USER, ...data };
  console.log('mail in sendEmail', mail);
  transporter.sendMail(mail)
  .then(info => console.log(info))
  .catch(err => console.log(err));
};

module.exports = sendEmail;
