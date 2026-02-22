/**
 * AES-256-GCM Encryption for HIPAA-Compliant Secure Messaging
 *
 * - Algorithm: AES-256-GCM (authenticated encryption)
 * - Key: derived from JWT_SECRET via PBKDF2 (32 bytes)
 * - IV: 16 random bytes per message (stored alongside ciphertext)
 * - Auth Tag: 16 bytes GCM authentication tag (stored for verification)
 * - No message content is ever stored in plaintext
 */

import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT = "therapycarenow-msg-encryption-v1";

let _encryptionKey: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (_encryptionKey) return _encryptionKey;

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured — cannot encrypt messages");

  // Derive a 256-bit key from JWT_SECRET using PBKDF2
  _encryptionKey = crypto.pbkdf2Sync(secret, SALT, 100_000, KEY_LENGTH, "sha256");
  return _encryptionKey;
}

export interface EncryptedPayload {
  encryptedContent: string; // base64
  iv: string; // hex
  authTag: string; // hex
}

/**
 * Encrypt a plaintext message using AES-256-GCM.
 * Each call generates a fresh random IV.
 */
export function encryptMessage(plaintext: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedContent: encrypted.toString("base64"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt a message encrypted with encryptMessage().
 * Throws if authentication tag verification fails (tamper detection).
 */
export function decryptMessage(payload: EncryptedPayload): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(payload.iv, "hex");
  const authTag = Buffer.from(payload.authTag, "hex");
  const encrypted = Buffer.from(payload.encryptedContent, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Safely attempt decryption — returns null if decryption fails
 * (e.g., key rotation, corrupted data). Used for graceful degradation.
 */
export function safeDecryptMessage(payload: EncryptedPayload): string | null {
  try {
    return decryptMessage(payload);
  } catch {
    return null;
  }
}
