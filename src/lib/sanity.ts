import { createClient, type SanityClient } from "@sanity/client";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET ?? "production";

export function isSanityConfigured() {
  return Boolean(projectId && dataset);
}

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) {
    return null;
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2025-02-19",
    useCdn: false,
  });
}
