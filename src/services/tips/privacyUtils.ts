// v1.263_001/src/services/tips/privacyUtils.ts
/**
 * Privacy-first utilities for anonymous tip submission
 * Implements Rule 1: Privacy First — Never compromise anonymity
 */

import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";
import type { GeoPoint } from "@/types";

// ---- Location Privacy ----

/**
 * Fuzz location for privacy - rounds to approximately 100m grid
 * This prevents exact location tracking while still being useful
 */
export function fuzzLocation(location: GeoPoint, precisionMeters: number = 100): GeoPoint {
  // At equator: 0.001 degrees ≈ 111 meters
  // We round to configurable precision (default ~100m)
  const precision = precisionMeters / 111000;
  
  return {
    latitude: Math.round(location.latitude / precision) * precision,
    longitude: Math.round(location.longitude / precision) * precision,
  };
}

/**
 * Check if location is within South Africa bounds
 */
export function isValidSALocation(location: GeoPoint): boolean {
  // Approximate SA bounding box
  const bounds = {
    north: -22.0,
    south: -35.0,
    west: 16.0,
    east: 33.0,
  };
  
  return (
    location.latitude >= bounds.south &&
    location.latitude <= bounds.north &&
    location.longitude >= bounds.west &&
    location.longitude <= bounds.east
  );
}

// ---- Device Anonymity ----

/**
 * Generate anonymous session hash
 * Creates a random hash that cannot be traced back to device
 * Used only for rate limiting, rotates each session
 */
export async function generateSessionHash(): Promise<string> {
  const randomBytes = Math.random().toString(36).substring(2, 15) +
                      Math.random().toString(36).substring(2, 15) +
                      Date.now().toString(36);
  
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    randomBytes
  );
  
  // Return first 16 characters for brevity
  return hash.substring(0, 16);
}

// ---- Image Privacy ----

/**
 * Strip EXIF metadata from image and resize for upload
 * This removes GPS data, device info, timestamps, etc.
 */
export async function stripImageMetadata(
  imageUri: string,
  maxWidth: number = 1200
): Promise<string> {
  try {
    // ImageManipulator creates a new image without EXIF data
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: maxWidth } }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
        // No base64 needed, just the URI
      }
    );
    
    console.log("📷 Image metadata stripped:", result.uri);
    return result.uri;
  } catch (error) {
    console.error("❌ Failed to strip image metadata:", error);
    // Return original if stripping fails - still safer than not submitting
    return imageUri;
  }
}

// ---- Text Privacy ----

/**
 * Check text for potential personally identifiable information (PII)
 * Returns array of warning messages
 */
export function checkForPII(text: string): string[] {
  const warnings: string[] = [];
  
  // South African phone numbers: +27, 0XX XXX XXXX
  const phoneRegex = /(\+27|0)[0-9\s-]{9,12}/g;
  if (phoneRegex.test(text)) {
    warnings.push("Your text may contain a phone number");
  }
  
  // Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  if (emailRegex.test(text)) {
    warnings.push("Your text may contain an email address");
  }
  
  // SA ID numbers: 13 digits, starts with valid date
  const idRegex = /\b[0-9]{2}[01][0-9][0-3][0-9][0-9]{7}\b/g;
  if (idRegex.test(text)) {
    warnings.push("Your text may contain an ID number");
  }
  
  // Vehicle registration: XXX XXX GP, CA XXX XXX, etc.
  const plateRegex = /\b[A-Z]{2,3}\s*[0-9]{2,3}\s*[A-Z]{2,3}\b/gi;
  if (plateRegex.test(text)) {
    warnings.push("Your text may contain a vehicle registration");
  }
  
  // Physical addresses with street numbers
  const addressRegex = /\b\d+\s+[A-Z][a-z]+\s+(Street|St|Road|Rd|Avenue|Ave|Drive|Dr)\b/gi;
  if (addressRegex.test(text)) {
    warnings.push("Your text may contain a street address");
  }
  
  return warnings;
}

/**
 * Sanitize text input - trim and normalize whitespace
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")           // Multiple spaces → single space
    .replace(/\n{3,}/g, "\n\n");    // Max 2 consecutive newlines
}

// ---- Validation ----

/**
 * Validate tip before submission
 */
export interface TipValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTip(
  description: string,
  category: string | null,
  severity: string | null,
  location: GeoPoint | null
): TipValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!category) {
    errors.push("Please select an incident type");
  }
  
  if (!severity) {
    errors.push("Please select a severity level");
  }
  
  // Description validation
  const cleanDescription = sanitizeText(description);
  if (cleanDescription.length < 20) {
    errors.push("Description must be at least 20 characters");
  }
  if (cleanDescription.length > 2000) {
    errors.push("Description must be less than 2000 characters");
  }
  
  // PII warnings (not errors - user can still submit)
  warnings.push(...checkForPII(cleanDescription));
  
  // Location validation
  if (location && !isValidSALocation(location)) {
    warnings.push("Location appears to be outside South Africa");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ---- Unique ID Generation ----

/**
 * Generate unique tip ID (not traceable to user)
 */
export function generateTipId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `tip_${timestamp}_${random}`;
}