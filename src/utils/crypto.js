import CryptoJS from "crypto-js";

export const encryption = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.CRYPTOJS_SECRET).toString();
};

export const decryption = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.CRYPTOJS_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};
