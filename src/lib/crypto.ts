import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  if (hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"
    );
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plaintext: string): {
  encryptedData: string;
  iv: string;
  authTag: string;
} {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedData: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
  };
}

export function decrypt(
  encryptedData: string,
  iv: string,
  authTag: string
): string {
  const key = getKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex"),
    { authTagLength: AUTH_TAG_LENGTH }
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  try {
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error(
      "Decryption failed: invalid key, IV, auth tag, or corrupted data"
    );
  }
}
