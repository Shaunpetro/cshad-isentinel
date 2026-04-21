// src/services/tips/tipService.ts
/**
 * Tip submission service
 * Handles anonymous tip creation and submission to Supabase
 */

import type { TipCategory, NewsSeverity, GeoPoint } from "@/types";
import { supabase } from "@/services/supabase";
import {
  fuzzLocation,
  sanitizeText,
  validateTip,
  generateSessionHash,
  stripImageMetadata,
} from "./privacyUtils";

// ---- Types ----

export interface TipDraft {
  category: TipCategory | null;
  severity: NewsSeverity | null;
  description: string;
  location: GeoPoint | null;
  locationName: string;
  photos: string[]; // Local URIs
}

export interface TipSubmissionResult {
  success: boolean;
  tipId?: string;
  error?: string;
}

interface SupabaseTipResponse {
  id: string;
}

// ---- Initial State ----

export const EMPTY_TIP_DRAFT: TipDraft = {
  category: null,
  severity: null,
  description: "",
  location: null,
  locationName: "",
  photos: [],
};

// ---- Image Upload ----

/**
 * Upload image to Supabase Storage
 * Returns public URL or null if failed
 */
async function uploadTipImage(
  imageUri: string,
  tipId: string
): Promise<string | null> {
  try {
    // Strip metadata first
    const cleanUri = await stripImageMetadata(imageUri);
    
    // Fetch image as blob
    const response = await fetch(cleanUri);
    const blob = await response.blob();
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${tipId}/${timestamp}.jpg`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("tip-images")
      .upload(filename, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });
    
    if (error) {
      console.error("❌ Image upload error:", error.message);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from("tip-images")
      .getPublicUrl(data.path);
    
    console.log("📷 Image uploaded:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error("❌ Image upload failed:", error);
    return null;
  }
}

// ---- Submission ----

/**
 * Submit an anonymous tip
 * Returns success status and tip ID (for reference only, not tracking)
 */
export async function submitTip(draft: TipDraft): Promise<TipSubmissionResult> {
  try {
    // Validate
    const validation = validateTip(
      draft.description,
      draft.category,
      draft.severity,
      draft.location
    );
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(". "),
      };
    }
    
    // Generate anonymous session hash (for rate limiting only)
    const anonymousId = await generateSessionHash();
    
    // Fuzz location for privacy (100m grid)
    const fuzzedLocation = draft.location 
      ? fuzzLocation(draft.location, 100) 
      : null;
    
    // Prepare tip data for Supabase
    const tipData = {
      anonymous_id: anonymousId,
      category: draft.category as string,
      severity: draft.severity as string,
      description: sanitizeText(draft.description),
      latitude: fuzzedLocation?.latitude ?? null,
      longitude: fuzzedLocation?.longitude ?? null,
      location_accuracy: fuzzedLocation ? 100 : null,
      image_url: null,
      status: 'pending',
    };
    
    console.log("📤 Submitting anonymous tip:", {
      category: tipData.category,
      severity: tipData.severity,
      hasLocation: !!fuzzedLocation,
      photoCount: draft.photos.length,
      descriptionLength: tipData.description.length,
    });
    
    // Insert tip into Supabase
    const { data, error } = await supabase
      .from("tips")
      .insert(tipData)
      .select("id")
      .single<SupabaseTipResponse>();
    
    if (error || !data) {
      console.error("❌ Supabase insert error:", error?.message);
      return {
        success: false,
        error: "Failed to submit tip. Please try again.",
      };
    }
    
    const tipId = data.id;
    console.log("✅ Tip created with ID:", tipId);
    
    // Upload photos (if any) and update tip with first image URL
    if (draft.photos.length > 0) {
      const imageUrl = await uploadTipImage(draft.photos[0], tipId);
      
      if (imageUrl) {
        // Update tip with image URL
        await supabase
          .from("tips")
          .update({ image_url: imageUrl })
          .eq("id", tipId);
      }
    }
    
    console.log("✅ Tip submitted successfully:", tipId);
    
    return {
      success: true,
      tipId,
    };
  } catch (error) {
    console.error("❌ Tip submission failed:", error);
    return {
      success: false,
      error: "Failed to submit tip. Please try again.",
    };
  }
}

/**
 * Get user-friendly location name from coordinates
 * Uses reverse geocoding
 */
export async function getLocationName(location: GeoPoint): Promise<string> {
  try {
    // Use Expo Location for reverse geocoding
    const Location = await import("expo-location");
    const results = await Location.reverseGeocodeAsync({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    
    if (results.length > 0) {
      const addr = results[0];
      const parts = [
        addr.district,
        addr.city,
        addr.region,
      ].filter(Boolean);
      
      if (parts.length > 0) {
        return parts.join(", ");
      }
    }
    
    // Fallback to coordinates
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  } catch (error) {
    console.warn("⚠️ Reverse geocoding failed:", error);
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
}