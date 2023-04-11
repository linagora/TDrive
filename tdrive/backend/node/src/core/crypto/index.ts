import legacy from "./legacy";
import v1 from "./v1";
import v2 from "./v2";
import { createHash } from "crypto";

export type CryptoResult = {
  /**
   * Encrypted | Decrypted data if done, original data if not done due to error or not encrypted data to decrypt
   */
  data: any;
  /**
   * Is there an error while processing the input data?
   */
  err?: Error;
  /**
   * Did we encrypted | decrypted the data? true if yes.
   */
  done?: boolean;
};

export function decrypt(data: string, encryptionKey: string): CryptoResult {
  let result = v2.decrypt(data, encryptionKey);
  if (result.done) {
    return result;
  }

  result = v1.decrypt(data, encryptionKey);
  if (result.done) {
    return result;
  }

  result = legacy.decrypt(data, encryptionKey);
  if (result.done) {
    return result;
  }

  return result;
}

export function md5(value: string): string {
  return createHash("md5").update(value).digest("hex");
}

export function encrypt(
  value: any,
  encryptionKey: any,
  options: { disableSalts?: boolean } = {},
): CryptoResult {
  return v2.encrypt(value, encryptionKey, options);
}
