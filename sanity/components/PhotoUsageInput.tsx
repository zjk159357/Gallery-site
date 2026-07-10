import { useEffect, useMemo, useState } from "react";
import { useClient, useFormValue } from "sanity";

type UsageResult = {
  siteHeroCount: number;
  homepageLayoutCount: number;
  featureCardCount: number;
  landscapeCount: number;
  quietCount: number;
  bannerOneCount: number;
  cityCount: number;
  plantsHeroCount: number;
  plantsCarouselCount: number;
  plantsFeatureCount: number;
  plantsStackCount: number;
  plantsSquareCount: number;
  photobalconyLayoutCount: number;
  photobalconyHeroCount: number;
  photobalconyMayCount: number;
  photobalconyMarchPortraitCount: number;
  photobalconyMarchWideCount: number;
  photobalconyFebruaryCount: number;
  photobalconyJanuaryCount: number;
  photobalconyWinterCount: number;
  photobalconySummerCount: number;
  storyCount: number;
  visibleStoryCount: number;
};

const usageQuery = `{
  "siteHeroCount": count(*[
    _type == "siteSettings" &&
    (heroPhoto._ref == $publishedId || heroPhoto._ref == $draftId)
  ]),
  "homepageLayoutCount": count(*[
    _type == "homepageLayout" &&
    (references($publishedId) || references($draftId))
  ]),
  "featureCardCount": count(*[
    _type == "homepageLayout" &&
    ($publishedId in featureCards[].photo._ref || $draftId in featureCards[].photo._ref)
  ]),
  "landscapeCount": count(*[
    _type == "homepageLayout" &&
    ($publishedId in landscapePhotos[]._ref || $draftId in landscapePhotos[]._ref)
  ]),
  "quietCount": count(*[
    _type == "homepageLayout" &&
    ($publishedId in quietPhotos[]._ref || $draftId in quietPhotos[]._ref)
  ]),
  "bannerOneCount": count(*[
    _type == "homepageLayout" &&
    (bannerOnePhoto._ref == $publishedId || bannerOnePhoto._ref == $draftId)
  ]),
  "cityCount": count(*[
    _type == "homepageLayout" &&
    ($publishedId in cityPhotos[]._ref || $draftId in cityPhotos[]._ref)
  ]),
  "plantsHeroCount": count(*[
    _type == "homepageLayout" &&
    (plantsHeroPhoto._ref == $publishedId || plantsHeroPhoto._ref == $draftId)
  ]),
  "plantsCarouselCount": count(*[
    _type == "homepageLayout" &&
    ($publishedId in plantsCarouselPhotos[]._ref || $draftId in plantsCarouselPhotos[]._ref)
  ]),
  "plantsFeatureCount": count(*[
    _type == "homepageLayout" &&
    (plantsFeaturePhoto._ref == $publishedId || plantsFeaturePhoto._ref == $draftId)
  ]),
  "plantsStackCount": count(*[
    _type == "homepageLayout" &&
    ($publishedId in plantsStackPhotos[]._ref || $draftId in plantsStackPhotos[]._ref)
  ]),
  "plantsSquareCount": count(*[
    _type == "homepageLayout" &&
    ($publishedId in plantsSquarePhotos[]._ref || $draftId in plantsSquarePhotos[]._ref)
  ]),
  "photobalconyLayoutCount": count(*[
    _type == "photobalconyLayout" &&
    (references($publishedId) || references($draftId))
  ]),
  "photobalconyHeroCount": count(*[
    _type == "photobalconyLayout" &&
    (heroPhoto._ref == $publishedId || heroPhoto._ref == $draftId)
  ]),
  "photobalconyMayCount": count(*[
    _type == "photobalconyLayout" &&
    ($publishedId in mayPhotos[]._ref || $draftId in mayPhotos[]._ref)
  ]),
  "photobalconyMarchPortraitCount": count(*[
    _type == "photobalconyLayout" &&
    ($publishedId in marchPortraitPhotos[]._ref || $draftId in marchPortraitPhotos[]._ref)
  ]),
  "photobalconyMarchWideCount": count(*[
    _type == "photobalconyLayout" &&
    ($publishedId in marchWidePhotos[]._ref || $draftId in marchWidePhotos[]._ref)
  ]),
  "photobalconyFebruaryCount": count(*[
    _type == "photobalconyLayout" &&
    ($publishedId in februaryPhotos[]._ref || $draftId in februaryPhotos[]._ref)
  ]),
  "photobalconyJanuaryCount": count(*[
    _type == "photobalconyLayout" &&
    ($publishedId in januaryPhotos[]._ref || $draftId in januaryPhotos[]._ref)
  ]),
  "photobalconyWinterCount": count(*[
    _type == "photobalconyLayout" &&
    ($publishedId in winterPhotos[]._ref || $draftId in winterPhotos[]._ref)
  ]),
  "photobalconySummerCount": count(*[
    _type == "photobalconyLayout" &&
    ($publishedId in summerPhotos[]._ref || $draftId in summerPhotos[]._ref)
  ]),
  "storyCount": count(*[
    _type == "story" &&
    (references($publishedId) || references($draftId))
  ]),
  "visibleStoryCount": count(*[
    _type == "story" &&
    isHidden != true &&
    (references($publishedId) || references($draftId))
  ])
}`;

function normalizeIds(id: unknown) {
  if (typeof id !== "string" || !id) {
    return undefined;
  }

  const publishedId = id.replace(/^drafts\./, "");
  return {
    publishedId,
    draftId: `drafts.${publishedId}`,
  };
}

function usageTone(usage: UsageResult | undefined) {
  if (!usage) return "#5f6368";
  if (
    usage.siteHeroCount ||
    usage.homepageLayoutCount ||
    usage.photobalconyLayoutCount ||
    usage.visibleStoryCount
  ) {
    return "#8a4b00";
  }
  if (usage.storyCount) return "#5f6368";
  return "#1b6b39";
}

function activeHomepageModules(usage: UsageResult) {
  return [
    ["Feature cards", usage.featureCardCount],
    ["Landscape carousel", usage.landscapeCount],
    ["Quiet square grid", usage.quietCount],
    ["First wide banner", usage.bannerOneCount],
    ["City carousel", usage.cityCount],
    ["Plants banner", usage.plantsHeroCount],
    ["Plants carousel", usage.plantsCarouselCount],
    ["Plants feature", usage.plantsFeatureCount],
    ["Plants full-width stack", usage.plantsStackCount],
    ["Plants square group", usage.plantsSquareCount],
  ].filter(([, count]) => Number(count) > 0);
}

function activePhotobalconyModules(usage: UsageResult) {
  return [
    ["Hero", usage.photobalconyHeroCount],
    ["May 2025 carousel", usage.photobalconyMayCount],
    ["March 2025 portrait row", usage.photobalconyMarchPortraitCount],
    ["March 2025 carousel", usage.photobalconyMarchWideCount],
    ["Feb 2025 carousel", usage.photobalconyFebruaryCount],
    ["Jan 2025 grid", usage.photobalconyJanuaryCount],
    ["Nov - Dec 2024 grid", usage.photobalconyWinterCount],
    ["July - Aug 2024 stack", usage.photobalconySummerCount],
  ].filter(([, count]) => Number(count) > 0);
}

export function PhotoUsageInput() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const documentId = useFormValue(["_id"]);
  const [usage, setUsage] = useState<UsageResult>();
  const [error, setError] = useState<string>();
  const ids = useMemo(() => normalizeIds(documentId), [documentId]);
  const publishedId = ids?.publishedId;
  const draftId = ids?.draftId;

  useEffect(() => {
    if (!publishedId || !draftId) return;

    let cancelled = false;

    client
      .fetch<UsageResult>(usageQuery, { publishedId, draftId })
      .then((result) => {
        if (!cancelled) {
          setUsage(result);
          setError(undefined);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not load usage data.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, draftId, publishedId]);

  const tone = usageTone(usage);
  const homepageModules = usage ? activeHomepageModules(usage) : [];
  const photobalconyModules = usage ? activePhotobalconyModules(usage) : [];

  return (
    <div
      style={{
        border: `1px solid ${tone}`,
        borderRadius: 6,
        padding: 12,
        background: "rgba(255,255,255,0.03)",
        color: "inherit",
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>Usage Summary</strong>
      {!ids ? (
        <p style={{ margin: 0 }}>Save this photo before usage can be checked.</p>
      ) : error ? (
        <p style={{ margin: 0 }}>Could not load usage data: {error}</p>
      ) : usage ? (
        <div style={{ display: "grid", gap: 10 }}>
          <section>
            <strong style={{ display: "block", marginBottom: 4 }}>Homepage</strong>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Hero setting references: {usage.siteHeroCount}</li>
              <li>Total homepage layout references: {usage.homepageLayoutCount}</li>
              {homepageModules.length ? (
                homepageModules.map(([label, count]) => (
                  <li key={label}>
                    {label}: {count}
                  </li>
                ))
              ) : (
                <li>No explicit homepage module reference.</li>
              )}
            </ul>
          </section>

          <section>
            <strong style={{ display: "block", marginBottom: 4 }}>Photobalcony</strong>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Total Photobalcony layout references: {usage.photobalconyLayoutCount}</li>
              {photobalconyModules.length ? (
                photobalconyModules.map(([label, count]) => (
                  <li key={label}>
                    {label}: {count}
                  </li>
                ))
              ) : (
                <li>No explicit Photobalcony layout reference.</li>
              )}
            </ul>
          </section>

          <section>
            <strong style={{ display: "block", marginBottom: 4 }}>Journal</strong>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Visible story references: {usage.visibleStoryCount}</li>
              <li>Total story references: {usage.storyCount}</li>
            </ul>
          </section>
        </div>
      ) : (
        <p style={{ margin: 0 }}>Loading usage data...</p>
      )}
    </div>
  );
}
