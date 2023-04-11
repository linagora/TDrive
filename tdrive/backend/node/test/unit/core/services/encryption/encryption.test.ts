import { describe, expect, it } from "@jest/globals";
import { decrypt } from "../../../../../src/core/crypto/index";
import v2 from "../../../../../src/core/crypto/v2";
import v1 from "../../../../../src/core/crypto/v1";
import legacy from "../../../../../src/core/crypto/legacy";

describe("Encryption", () => {
  const encryptionKey = "a7c06651a7c063bb3e90c0c9a17eab88ab8977665127196a";

  describe("The encrypt/decrypt functions", () => {
    it("should successfully describe legacy encrypted values", async () => {
      const legacyEncrypted = "encrypted_DwMLnKhuFbIanqBJPA5rcw==";

      expect(legacy.decrypt(legacyEncrypted, encryptionKey).data).toBe("My company");
      expect(decrypt(legacyEncrypted, encryptionKey).data).toBe("My company");
    });

    it("should successfully describe all versions", async () => {
      const myData = { key: "some data" };

      const v1Encrypted = v1.encrypt(myData, encryptionKey);
      const v2Encrypted = v2.encrypt(myData, encryptionKey);

      expect(v1.decrypt(v1Encrypted.data, encryptionKey).data).toMatchObject(myData);
      expect(v2.decrypt(v2Encrypted.data, encryptionKey).data).toMatchObject(myData);

      expect(decrypt(v1Encrypted.data, encryptionKey).data).toMatchObject(myData);
      expect(decrypt(v2Encrypted.data, encryptionKey).data).toMatchObject(myData);
    });
  });
});
