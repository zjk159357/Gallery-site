import { useEffect, useMemo, useState } from "react";
import { useClient, useFormValue } from "sanity";

type UsageResult = {
  homepageCount: number;
  siteHeroCount: number;
  storyCount: number;
  visibleStoryCount: number;
};

const usageQuery = `{
  "homepageCount": count(*[
    _type == "homepageLayout" &&
    (references($publishedId) || references($draftId))
  ]),
  "siteHeroCount": count(*[
    _type == "siteSettings" &&
    (heroPhoto._ref == $publishedId || heroPhoto._ref == $draftId)
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
  if (usage.siteHeroCount || usage.homepageCount || usage.visibleStoryCount) return "#8a4b00";
  if (usage.storyCount) return "#5f6368";
  return "#1b6b39";
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
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Homepage layout references: {usage.homepageCount}</li>
          <li>Site hero references: {usage.siteHeroCount}</li>
          <li>Visible story references: {usage.visibleStoryCount}</li>
          <li>Total story references: {usage.storyCount}</li>
        </ul>
      ) : (
        <p style={{ margin: 0 }}>Loading usage data...</p>
      )}
    </div>
  );
}
