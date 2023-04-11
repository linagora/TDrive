import { CrudException } from "../core/platform/framework/api/crud-service";
import crypto from "crypto";
import assert from "assert";
import bcrypt from "bcrypt";

export default class {
  private readonly algorithm = "sha512";
  private readonly encodeHashAsBase64 = true;
  private readonly iterations = 5000;
  private readonly encodedLength: number;

  constructor() {
    this.encodedLength = this.encodePasswordOldWay("", "salt").length;
  }

  protected mergePasswordAndSalt(password: string, salt?: string): string {
    if (!salt) {
      return password;
    }

    return password + "{" + salt + "}";
  }

  protected isPasswordTooLong(password: string): boolean {
    return password.length > 4096;
  }

  public encodePassword(password: string): Promise<string> {
    assert(password, "Password is not defined for encodePassword");
    return bcrypt.hash(password, 10);
  }

  public encodePasswordOldWay(raw: string, salt?: string): string {
    if (this.isPasswordTooLong(raw)) {
      throw CrudException.badRequest("Invalid password.");
    }
    const salted = Buffer.from(this.mergePasswordAndSalt(raw, salt));
    let digest = crypto.createHash(this.algorithm).update(salted).digest();
    for (let i = 1; i < this.iterations; ++i) {
      digest = crypto
        .createHash(this.algorithm)
        .update(Buffer.concat([digest, salted]))
        .digest();
    }
    return Buffer.from(digest).toString("base64");
  }

  public isPasswordValid(encoded: string, raw: string, salt?: string): Promise<boolean> {
    if (salt) {
      // Old implementation
      return Promise.resolve().then(() => {
        if (encoded.length !== this.encodedLength) {
          return false;
        }

        return (
          !this.isPasswordTooLong(raw) &&
          this.hashEquals(encoded, this.encodePasswordOldWay(raw, salt))
        );
      });
    } else {
      return bcrypt.compare(raw, encoded);
    }
  }

  private hashEquals = (answer: string, guess: string) => {
    assert(
      typeof answer === "string" && typeof guess === "string",
      "both arguments should be strings",
    );

    const rb = crypto.pseudoRandomBytes(32);
    const ahmac = crypto.createHmac("sha256", rb).update(answer).digest("hex");
    const ghmac = crypto.createHmac("sha256", rb).update(guess).digest("hex");
    const len = ahmac.length;
    let result = 0;
    for (let i = 0; i < len; ++i) {
      result |= ahmac.charCodeAt(i) ^ ghmac.charCodeAt(i);
    }
    return result === 0;
  };
}
