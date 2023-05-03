const {checkUser, addUser, recordToken, updateSubUser} = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');

const formatAvatar = require('../helpers/formatAvatar');
const path = require('path');

const {SECRET_KEY} = process.env;


const register = async(req, res, next) => {
  try {
    const {name, email, password} = req.body;
    const result = await checkUser({email: email});
    if (result) {
      return res.status(409).json({message: 'Email in use'});
    }
    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const newUser = await addUser({name, email, password: hashPassword, avatarURL: gravatar.url(email, { d: 'retro' })});
    res.status(201).json({user: {email: newUser.email, subscription: newUser.subscription}});
  } catch (error) {
    next(error);
  }
};

const login = async(req, res, next) => {
  try {
    const {email, password} = req.body;
    const result = await checkUser({email: email});
    if (!result) {
      return res.status(401).json({message: 'Email or password is wrong'});
    };
    const passCompare = bcrypt.compareSync(password, result.password);
    if (!passCompare) {
      return res.status(401).json({message: 'Email or password is wrong'});
    };
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
    const avatarsPath = path.join('/avatars', `${req.user.id}-avatar.png`);
    formatAvatar(req.file.path, avatarsPath);    
    const result = await updateSubUser(req.user.id, {avatarURL: avatarsPath});
    if (result) {
      return res.json({ "avatarURL": avatarsPath });
    };
    res.status(404).json({ message: "Not found" });
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
  patchAvatar
};