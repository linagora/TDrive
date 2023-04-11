import { createDecipheriv } from "crypto";
import { CryptoResult } from ".";

const PREFIX = "encrypted_";

export default {
  decrypt,
  encrypt,
};

function decrypt(data: string, encryptionKey: string): CryptoResult {
  if (!data || !data.startsWith(PREFIX)) {
    return {
      data,
      done: false,
    };
  }

  const toDecode = data.substr(PREFIX.length);
  const encryptedArray = toDecode.split("_");

  // If array length is 1, the value has not been salted and iv is the default one
  const encrypted = Buffer.from(encryptedArray[0], "base64");
  const salt = encryptedArray[1]
    ? Buffer.from(encryptedArray[1], "utf-8")
    : Buffer.from("", "utf-8");
  const iv =
    encryptedArray.length >= 3
      ? Buffer.from(encryptedArray[2], "base64")
      : Buffer.from("twake_constantiv", "utf-8");
  const password = Buffer.concat([Buffer.from(encryptionKey, "hex"), salt], 32);
  const decipher = createDecipheriv("AES-256-CBC", password, iv);

  return {
    data: Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf-8"),
    done: true,
  };
}

function encrypt(data: any): CryptoResult {
  return {
    data,
    done: false,
  };
}
