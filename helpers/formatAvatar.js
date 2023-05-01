const Jimp = require("jimp");
// const path = require('path');

const formatAvatar = async(pathOriginAvatar, pathNewAvatar) => {
  const newAvatar = await Jimp.read(pathOriginAvatar);
  await newAvatar.resize(250, 250).writeAsync(pathNewAvatar);
};

module.exports = formatAvatar;