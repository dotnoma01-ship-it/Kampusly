const crypto = require("node:crypto");

function getEncryptionKey() {
  const encoded = process.env.BANK_ACCOUNT_ENCRYPTION_KEY;

  if (!encoded) {
    throw Object.assign(new Error("Secure bank account storage is not configured."), {
      status: 503
    });
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw Object.assign(new Error("Bank account encryption configuration is invalid."), {
      status: 503
    });
  }

  return key;
}

function encryptBankValue(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final()
  ]);

  return [iv, cipher.getAuthTag(), ciphertext]
    .map(part => part.toString("base64"))
    .join(".");
}

function decryptBankValue(value) {
  const [encodedIv, encodedTag, encodedCiphertext] = String(value).split(".");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(encodedIv, "base64")
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64")),
    decipher.final()
  ]).toString("utf8");
}

module.exports = { encryptBankValue, decryptBankValue };
