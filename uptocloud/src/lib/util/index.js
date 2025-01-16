const BYTE_SIZE = {
  b: 0,
  k: 1024,
  m: 1024 * 1024,
  g: 1024 * 1024 * 1024,
  t: 1024 * 1024 * 1024 * 1024,
};
const humanByte = (byte) => {
  if (byte < BYTE_SIZE.k) {
    return byte + " bytes";
  }
  if (byte < BYTE_SIZE.m) {
    return byte / BYTE_SIZE.k + " KB";
  }
  if (byte < BYTE_SIZE.g) {
    return byte / BYTE_SIZE.m + " MB";
  }
  if (byte < BYTE_SIZE.t) {
    return byte / BYTE_SIZE.g + " GB";
  }
  return 0;
};

const ACTION_TYPE = {
  UPLOADED: "UPLOADED",
  TRANSCODED: "TRANSCODED",
  THUMBNAILED: "THUMBNAILED",
};

const KEYS = {
    USER_SESSION_COOKIE: "usersession",
    JWT_TOKEN_EXPIRY: "30d",
};

module.exports = {
  humanByte,
  ACTION_TYPE,
  KEYS
};

