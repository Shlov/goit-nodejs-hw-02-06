// 
// Test send email
// 

require('dotenv').config();
const nodemailer = require('nodemailer');

const {META_PASSWORD, META_USER} = process.env;

// 
// 
const config = {
  host: 'smtp.meta.ua',
  port: 465,
  secure: true,
  auth: {
    user: META_USER,
    pass: META_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(config);
const emailOptions = {
  from: META_USER,
  to: 'shlov@ukr.net',
  subject: 'Test. Email confirmation. PhoneBook.',
  // text: 'Привіт. Ми тестуємо надсилання листів!',
  html: `<a target="_blank" href="http://localhost:3000/users/verify/777">Test. Натисніть для підтвердження пошти</a>`
};

console.log('mail in TEST', emailOptions);

transporter
  .sendMail(emailOptions)
  .then(info => console.log(info))
  .catch(err => console.log(err));
// 
// 

// const nodemailerConfig = {
//   host: 'smtp.meta.ua',
//   port: 465,
//   secure: true,
//   auth: {
//     user: META_USER,
//     pass: META_PASSWORD
//   }
// };

// const transporter = nodemailer.createTransport(nodemailerConfig);

// const sendEmail = async(data) => {
//   const mail = {...data, from: META_USER };
//   console.log('mail in sendEmail', mail);
//   try {
//     await transporter.sendMail(mail);
//     return true
//   } catch (error) {
//     return error
//   }
// };

// module.exports = sendEmail;


