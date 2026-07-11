/**
 * App lock — a local PIN (with optional biometric unlock).
 *
 * The PIN is never stored in plain text: we keep only a salted SHA-256 hash in
 * the OS secure store (Keychain / Keystore). Biometric unlock uses the device's
 * Face ID / Touch ID / fingerprint via expo-local-authentication.
 *
 * All state lives in the secure store — independent of the budget blob — so
 * "Reset everything" in Settings never removes the lock.
 */

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';

const KEY_PIN_HASH = 'appLock.pinHash';
const KEY_ENABLED = 'appLock.enabled';
const KEY_BIOMETRIC = 'appLock.biometric';

/** Fixed PIN length. Four digits — the familiar phone-unlock length. */
export const PIN_LENGTH = 4;

// A static app-specific salt. The real protection is the secure store; the
// salt just stops the hash from being a plain unsalted SHA-256 of the digits.
const SALT = 'budgettracker.v1.applock';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${SALT}:${pin}`);
}

/** True when an app-lock PIN has been set and lock is enabled. */
export async function isLockEnabled(): Promise<boolean> {
  const enabled = await SecureStore.getItemAsync(KEY_ENABLED).catch(() => null);
  return enabled === 'true';
}

/** True when the user has opted into biometric unlock. */
export async function isBiometricEnabled(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(KEY_BIOMETRIC).catch(() => null);
  return v === 'true';
}

/** Enable the lock with a new PIN (and whether to allow biometric unlock). */
export async function enableLock(pin: string, useBiometric: boolean): Promise<void> {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(KEY_PIN_HASH, hash);
  await SecureStore.setItemAsync(KEY_ENABLED, 'true');
  await SecureStore.setItemAsync(KEY_BIOMETRIC, useBiometric ? 'true' : 'false');
}

/** Change the PIN (lock stays enabled). */
export async function changePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(KEY_PIN_HASH, hash);
}

/** Turn the lock off and wipe stored secrets. */
export async function disableLock(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PIN_HASH).catch(() => {});
  await SecureStore.deleteItemAsync(KEY_ENABLED).catch(() => {});
  await SecureStore.deleteItemAsync(KEY_BIOMETRIC).catch(() => {});
}

/** Opt in/out of biometric unlock without changing the PIN. */
export async function setBiometricEnabled(on: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEY_BIOMETRIC, on ? 'true' : 'false');
}

/** Verify an entered PIN against the stored hash. */
export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(KEY_PIN_HASH).catch(() => null);
  if (!stored) return false;
  const hash = await hashPin(pin);
  return hash === stored;
}

/** True when the device has enrolled biometrics we can use. */
export async function biometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync().catch(() => false);
  const enrolled = await LocalAuthentication.isEnrolledAsync().catch(() => false);
  return hasHardware && enrolled;
}

/** Prompt for Face ID / Touch ID / fingerprint. Returns true on success. */
export async function authenticateBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Budget Tracker',
    fallbackLabel: 'Enter PIN',
    disableDeviceFallback: true,
  }).catch(() => ({ success: false }) as LocalAuthentication.LocalAuthenticationResult);
  return result.success;
}
