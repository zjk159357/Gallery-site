import { useEffect, useMemo, useState } from "react";
import { useClient, useFormValue } from "sanity";

type ReadinessResult = {
  homepageLayoutCount: number;
  siteHeroCount: number;
  photobalconyLayoutCount: number;
  storyCount: number;
  visibleStoryCount: number;
  hasImage: boolean;
  hasCategory: boolean;
  hasSlug: boolean;
  hasSortOrder: boolean;
  isHidden: boolean;
};

const readinessQuery = `*[_id == $publishedId || _id == $draftId][0]{
  "homepageLayoutCount": count(*[
    _type == "homepageLayout" &&
    (references($publishedId) || references($draftId))
  ]),
  "siteHeroCount": count(*[
    _type == "siteSettings" &&
    (heroPhoto._ref == $publishedId || heroPhoto._ref == $draftId)
  ]),
  "photobalconyLayoutCount": count(*[
    _type == "photobalconyLayout" &&
    (references($publishedId) || references($draftId))
  ]),
  "storyCount": count(*[
    _type == "story" &&
    (references($publishedId) || references($draftId))
  ]),
  "visibleStoryCount": count(*[
    _type == "story" &&
    isHidden != true &&
    (references($publishedId) || references($draftId))
  ]),
  "hasImage": defined(image.asset._ref),
  "hasCategory": defined(category._ref),
  "hasSlug": defined(slug.current),
  "hasSortOrder": defined(sortOrder),
  "isHidden": isHidden == true
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

function statusStyle(tone: "ready" | "warning" | "blocked") {
  if (tone === "ready") {
    return { border: "#b7dfc5", background: "#e8f5ec", color: "#136c3a" };
  }
  if (tone === "blocked") {
    return { border: "#f2b8b5", background: "#fdebea", color: "#a5281b" };
  }
  return { border: "#f2cf8f", background: "#fff4df", color: "#8a4b00" };
}

function buildReadiness(result: ReadinessResult) {
  const blocking = [
    !result.hasImage ? "Missing image asset" : undefined,
    !result.hasCategory ? "Missing category" : undefined,
    !result.hasSlug ? "Missing slug" : undefined,
  ].filter(Boolean);

  const warnings = [
    !result.hasSortOrder ? "Missing sort order" : undefined,
    result.isHidden ? "Hidden from website" : undefined,
    result.homepageLayoutCount === 0 &&
    result.siteHeroCount === 0 &&
    result.photobalconyLayoutCount === 0 &&
    result.storyCount === 0
      ? "Not referenced by Homepage, Photobalcony, or Journal"
      : undefined,
  ].filter(Boolean);

  if (blocking.length) {
    return { label: "Blocked", tone: "blocked" as const, blocking, warnings };
  }

  if (warnings.length) {
    return { label: "Needs review", tone: "warning" as const, blocking, warnings };
  }

  return { label: "Ready", tone: "ready" as const, blocking, warnings };
}

export function PhotoReadinessInput() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const documentId = useFormValue(["_id"]);
  const ids = useMemo(() => normalizeIds(documentId), [documentId]);
  const [readiness, setReadiness] = useState<ReadinessResult>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!ids) return;

    let cancelled = false;

    client
      .fetch<ReadinessResult | null>(readinessQuery, ids)
      .then((result) => {
        if (!cancelled) {
          setReadiness(result ?? undefined);
          setError(undefined);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not load readiness data.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, ids]);

  if (!ids) {
    return (
      <div style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: 12 }}>
        Save this photo before readiness can be checked.
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ border: "1px solid #f2b8b5", borderRadius: 6, padding: 12, color: "#a5281b" }}>
        Could not load readiness data: {error}
      </div>
    );
  }

  if (!readiness) {
    return <div style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: 12 }}>Loading readiness...</div>;
  }

  const summary = buildReadiness(readiness);
  const style = statusStyle(summary.tone);

  return (
    <div
      style={{
        border: `1px solid ${style.border}`,
        borderRadius: 6,
        padding: 12,
        background: style.background,
        color: style.color,
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>Photo Readiness: {summary.label}</strong>

      {summary.blocking.length ? (
        <section style={{ marginBottom: 8 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>Must fix</strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {summary.blocking.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {summary.warnings.length ? (
        <section style={{ marginBottom: 8 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>Review</strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {summary.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <strong style={{ display: "block", marginBottom: 4 }}>Current placement</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Homepage references: {readiness.homepageLayoutCount + readiness.siteHeroCount}</li>
          <li>Photobalcony references: {readiness.photobalconyLayoutCount}</li>
          <li>Visible story references: {readiness.visibleStoryCount}</li>
          <li>Total story references: {readiness.storyCount}</li>
        </ul>
      </section>
    </div>
  );
}
