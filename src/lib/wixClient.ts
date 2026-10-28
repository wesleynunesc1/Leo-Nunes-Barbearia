import { createClient, ApiKeyStrategy } from "@wix/sdk";
import {
  services,
  resources,
  staffMembers,
  availabilityTimeSlots,
  multiServiceAvailabilityTimeSlots,
  bookings,
  extendedBookings,
} from "@wix/bookings";
import { members } from "@wix/members";
import { items } from "@wix/data";

export function getWixClient() {
  const apiKey = process.env.WIX_API_KEY?.trim();
  const siteId = process.env.WIX_SITE_ID?.trim();

  if (!apiKey || !siteId) {
    return null;
  }

  return createClient({
    modules: {
      services,
      resources,
      staffMembers,
      availabilityTimeSlots,
      multiServiceAvailabilityTimeSlots,
      bookings,
      extendedBookings,
      members,
      items,
    },
    auth: ApiKeyStrategy({
      apiKey,
      siteId,
    }),
  });
}

export function isWixConfigured(): boolean {
  return Boolean(process.env.WIX_API_KEY?.trim() && process.env.WIX_SITE_ID?.trim());
}
