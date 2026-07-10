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

const photobalconyPlacementsByFilename: Record<string, string[]> = {
  "DSC_0243.JPG": ["Photobalcony hero"],
  "DSC_0257.JPG": ["Photobalcony May 2025 carousel"],
  "DSC_0518.JPG": ["Photobalcony May 2025 carousel"],
  "DSC_0521.JPG": ["Photobalcony May 2025 carousel"],
  "DSC_0522.JPG": ["Photobalcony May 2025 carousel"],
  "DSC_0264.JPG": ["Photobalcony March 2025 portrait row"],
  "DSC_0335.JPG": ["Photobalcony March 2025 portrait row"],
  "DSC_0396.JPG": ["Photobalcony March 2025 portrait row"],
  "DSC_0470.JPG": ["Photobalcony March 2025 portrait row"],
  "DSC_0534.JPG": ["Photobalcony March 2025 carousel"],
  "DSC_0555.JPG": ["Photobalcony March 2025 carousel"],
  "DSC_0566.JPG": ["Photobalcony March 2025 carousel"],
  "DSC_0580.JPG": ["Photobalcony Feb 2025 carousel"],
  "DSC_0613.JPG": ["Photobalcony Feb 2025 carousel"],
  "DSC_0626.JPG": ["Photobalcony Feb 2025 carousel"],
  "DSC_0632.JPG": ["Photobalcony Feb 2025 carousel"],
  "DSC_0513.JPG": ["Photobalcony Jan 2025 grid"],
  "DSC_0514.JPG": ["Photobalcony Jan 2025 grid"],
  "DSC_0520.JPG": ["Photobalcony Jan 2025 grid"],
  "DSC_0538.JPG": ["Photobalcony Jan 2025 grid"],
  "DSC_0546.JPG": ["Photobalcony Nov - Dec 2024 grid"],
  "DSC_0551.JPG": ["Photobalcony Nov - Dec 2024 grid"],
  "DSC_0552.JPG": ["Photobalcony Nov - Dec 2024 grid"],
  "DSC_0571.JPG": ["Photobalcony Nov - Dec 2024 grid"],
  "DSC_0638.JPG": ["Photobalcony July - Aug 2024 stack"],
  "DSC_0648.JPG": ["Photobalcony July - Aug 2024 stack"],
  "DSC_0917.JPG": ["Photobalcony July - Aug 2024 stack"],
  "DSC_2196.JPG": ["Photobalcony July - Aug 2024 stack"],
};

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

function usageTone(usage: UsageResult | undefined, photobalconyPlacements: string[]) {
  if (!usage) return "#5f6368";
  if (
    usage.siteHeroCount ||
    usage.homepageLayoutCount ||
    photobalconyPlacements.length ||
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

export function PhotoUsageInput() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const documentId = useFormValue(["_id"]);
  const sourceFilename = useFormValue(["sourceFilename"]);
  const [usage, setUsage] = useState<UsageResult>();
  const [error, setError] = useState<string>();
  const ids = useMemo(() => normalizeIds(documentId), [documentId]);
  const publishedId = ids?.publishedId;
  const draftId = ids?.draftId;
  const photobalconyPlacements =
    typeof sourceFilename === "string" ? photobalconyPlacementsByFilename[sourceFilename] ?? [] : [];

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

  const tone = usageTone(usage, photobalconyPlacements);
  const homepageModules = usage ? activeHomepageModules(usage) : [];

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
            {photobalconyPlacements.length ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {photobalconyPlacements.map((placement) => (
                  <li key={placement}>{placement}</li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0 }}>No fixed Photobalcony position.</p>
            )}
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
