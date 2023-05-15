const {checkUser, addUser, recordToken, updateSubUser} = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const crypto = require('crypto');
const sendEmail = require('../helpers/sendEmail');

const formatAvatar = require('../helpers/formatAvatar');
const path = require('path');

const {SECRET_KEY} = process.env;


const register = async(req, res, next) => {
  try {
    const {name, email, password} = req.body;
    const result = await checkUser({email: email});
    if (result) {
      return res.status(409).json({message: 'Email in use'});
    };
    const verificationToken = crypto.randomUUID();
    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const mail = {
      to: email,
      subject: 'Email confirmation. PhoneBook.',
      html: `<a target="_blank" href="http://localhost:3000/users/verify/${verificationToken}">To confirm email</a>`,
      // text: `Натисніть для підтвердження пошти http://localhost:3000/users/verify/${verificationToken}`
    };
    await sendEmail(mail);

    const newUser = await addUser({name, email, password: hashPassword, avatarURL: gravatar.url(email, { d: 'retro' }), verificationToken});
    res.status(201).json({user: {email: newUser.email, subscription: newUser.subscription}});
  } catch (error) {
    next(error);
  }
};

const login = async(req, res, next) => {
  try {
    const {email, password} = req.body;
    const result = await checkUser({email: email});
    console.log(!result || !result.verify || bcrypt.compareSync(password, result.password))
    if (!result || !result.verify || !bcrypt.compareSync(password, result.password)) {
      return res.status(401).json({message: 'Email or password is wrong'});
    };
    // const passCompare = bcrypt.compareSync(password, result.password);
    // if (!passCompare) {
    //   return res.status(401).json({message: 'Email or password is wrong'});
    // };
    // if (!result.verify) {
    //   return res.status(401).json({message: 'Email or password is wrong'});
    // };
    const payload = {id: result._id, name: result.name};
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: '1d'});
    await recordToken(result._id, token);
    res.json({token , user: {email: result.email, subscription: result.subscription}});
  } catch (error) {
    next(error);
  };
};

const logout = async(req, res, next) => {
  try {
    await recordToken(req.user.id, null);
    req.user = null;
    res.status(204).end();
  } catch (error) {
    next(error);
  };
};

const current = async(req, res, next) => {
  try {
    
    const user = await checkUser({_id: req.user.id});
    if (!user) {
      return res.status(401).json({
        message: "Not authorized"
      });
    };
    res.json({email: user.email, subscription: user.subscription});
  } catch (error) {
    next(error);
  };
};

const patchSubscription = async(req, res, next) => {
  try {
    if (!Object.keys(req.body).includes('subscription')) {
      return res.status(400).json({ message: "missing field subscription" });
    };
    console.log({subscription: req.body.subscription})
    const result = await updateSubUser(req.user.id, {subscription: req.body.subscription});
    if (result) {
      return res.json(result);
    };
    res.status(404).json({ message: "Not found" });
  } catch (error) {
    next(error);
  };
};

const patchAvatar = async(req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "avatar file missing" });
    };    
    const avatarsPath = path.join(__dirname, '../public/avatars', `${req.user.id}-avatar.png`);
    const avatarsURL = path.join('/avatars', `${req.user.id}-avatar.png`);
    await formatAvatar(req.file.path, avatarsPath);
    const result = await updateSubUser(req.user.id, {avatarURL: avatarsURL});
    if (result) {
      return res.json({ "avatarURL": avatarsURL });
    };
    res.status(404).json({ message: "Not found" });
  } catch (error) {
    next(error);
  };
};

const verifyEmail = async(req, res, next) => {
  const {verificationToken} = req.params;
  console.log('tut')
  try {
    if (!verificationToken) {
      return res.status(404).json({ message: "Not found" });
    };
    const user = await checkUser({verificationToken: verificationToken});
    if (!user) {
      return res.status(404).json({ message: "Not found" });
    };
    await updateSubUser(user._id, {verify: true, verificationToken: null});
    if (user) {
      return res.json({message: 'Verification successful'});
    };
    res.status(404).json({ message: "Not found" });
  } catch (error) {
    next(error);
  };
};

const resendVerification = async(req, res, next) => {
  const {email} = req.body;
  if (!Object.keys(req.body).includes('email')) {
    return res.status(400).json({ message: "missing required field email" });
  };
  try {
    const user = await checkUser({email: email});
    if (!user) {
      return res.status(404).json({ message: "Not found" });
    };
    if (user.verify) {
      return res.status(400).json({ message: "Verification has already been passed" });
    };
    const mail = {
      to: email,
      subject: 'Email confirmation. PhoneBook.',
      html: `<a target="_blank" href="http://localhost:3000/users/verify/${user.verificationToken}">To confirm email</a>`,
    };
    await sendEmail(mail);
    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  };
};



module.exports = {
  register,
  login,
  logout,
  current,
  patchSubscription,
  patchAvatar,
  verifyEmail,
  resendVerification
};