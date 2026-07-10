import { useCallback, useEffect, useState } from "react";
import { useClient } from "sanity";

type ChecklistKey =
  | "hiddenHomepagePhotos"
  | "hiddenStoryPhotos"
  | "visibleStoriesMissingCover"
  | "hiddenStories"
  | "photosMissingImage"
  | "photosMissingCategory"
  | "multipleHeroFlags"
  | "emptyHomepageModules";

type ChecklistCounts = Record<ChecklistKey, number>;

type ChecklistItem = {
  key: ChecklistKey;
  title: string;
  severity: "blocking" | "warning";
  listTitle: string;
};

const checklistItems: ChecklistItem[] = [
  {
    key: "hiddenHomepagePhotos",
    title: "Hidden photos used on homepage",
    severity: "blocking",
    listTitle: "Hidden But Used On Homepage",
  },
  {
    key: "hiddenStoryPhotos",
    title: "Hidden photos used by visible stories",
    severity: "blocking",
    listTitle: "Hidden But Used By Visible Stories",
  },
  {
    key: "visibleStoriesMissingCover",
    title: "Visible stories missing cover",
    severity: "blocking",
    listTitle: "Visible Stories Missing Cover",
  },
  {
    key: "hiddenStories",
    title: "Stories hidden from website",
    severity: "warning",
    listTitle: "Stories Hidden From Website",
  },
  {
    key: "photosMissingImage",
    title: "Photos missing image asset",
    severity: "blocking",
    listTitle: "Photos Missing Image Asset",
  },
  {
    key: "photosMissingCategory",
    title: "Photos missing category",
    severity: "blocking",
    listTitle: "Photos Missing Category",
  },
  {
    key: "multipleHeroFlags",
    title: "Multiple hero flag photos",
    severity: "blocking",
    listTitle: "Multiple Hero Flag Photos",
  },
  {
    key: "emptyHomepageModules",
    title: "Homepage layout empty modules",
    severity: "warning",
    listTitle: "Homepage Layout Empty Modules",
  },
];

const checklistQuery = `{
  "hiddenHomepagePhotos": count(*[
    _type == "photo" &&
    isHidden == true &&
    count(*[_type == "homepageLayout" && references(^._id)]) > 0
  ]),
  "hiddenStoryPhotos": count(*[
    _type == "photo" &&
    isHidden == true &&
    count(*[
      _type == "story" &&
      isHidden != true &&
      (!defined(publishedAt) || dateTime(publishedAt) <= dateTime(now())) &&
      references(^._id)
    ]) > 0
  ]),
  "visibleStoriesMissingCover": count(*[
    _type == "story" &&
    isHidden != true &&
    (!defined(publishedAt) || dateTime(publishedAt) <= dateTime(now())) &&
    !defined(coverPhoto._ref)
  ]),
  "hiddenStories": count(*[_type == "story" && isHidden == true]),
  "photosMissingImage": count(*[_type == "photo" && !defined(image.asset._ref)]),
  "photosMissingCategory": count(*[_type == "photo" && !defined(category._ref)]),
  "multipleHeroFlags": select(
    count(*[_type == "photo" && isHero == true]) > 1 => count(*[_type == "photo" && isHero == true]),
    0
  ),
  "emptyHomepageModules": count(*[
    _type == "homepageLayout" &&
    (
      !defined(featureCards[0]) ||
      !defined(landscapePhotos[0]) ||
      !defined(quietPhotos[0]) ||
      !defined(bannerOnePhoto._ref) ||
      !defined(cityPhotos[0]) ||
      !defined(plantsHeroPhoto._ref) ||
      !defined(plantsCarouselPhotos[0]) ||
      !defined(plantsStackPhotos[0]) ||
      !defined(plantsSquarePhotos[0])
    )
  ])
}`;

const emptyCounts: ChecklistCounts = {
  hiddenHomepagePhotos: 0,
  hiddenStoryPhotos: 0,
  visibleStoriesMissingCover: 0,
  hiddenStories: 0,
  photosMissingImage: 0,
  photosMissingCategory: 0,
  multipleHeroFlags: 0,
  emptyHomepageModules: 0,
};

function countSeverity(counts: ChecklistCounts, severity: ChecklistItem["severity"]) {
  return checklistItems
    .filter((item) => item.severity === severity)
    .reduce((total, item) => total + counts[item.key], 0);
}

function badgeStyle(count: number, severity: ChecklistItem["severity"]) {
  if (count === 0) return { background: "#e8f5ec", color: "#136c3a", borderColor: "#b7dfc5" };
  if (severity === "blocking") return { background: "#fdebea", color: "#a5281b", borderColor: "#f2b8b5" };
  return { background: "#fff4df", color: "#8a4b00", borderColor: "#f2cf8f" };
}

export function PublishingChecklistDashboard() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [counts, setCounts] = useState<ChecklistCounts>(emptyCounts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadCounts = useCallback(() => {
    setIsLoading(true);
    client
      .fetch<ChecklistCounts>(checklistQuery)
      .then((result) => {
        setCounts({ ...emptyCounts, ...result });
        setError(undefined);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Could not load checklist counts.");
      })
      .finally(() => setIsLoading(false));
  }, [client]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const blockingCount = countSeverity(counts, "blocking");
  const warningCount = countSeverity(counts, "warning");

  return (
    <main style={{ padding: 24, maxWidth: 960 }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 6px", color: "#6b7280", fontSize: 13, fontWeight: 600 }}>Publishing Checklist</p>
        <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>Overview</h1>
        <p style={{ margin: "10px 0 0", color: "#4b5563", lineHeight: 1.5 }}>
          Review these counts before publishing. Open the matching list below this Overview to inspect the affected documents.
        </p>
      </header>

      <section style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, minWidth: 160 }}>
          <strong style={{ display: "block", fontSize: 28, color: blockingCount ? "#a5281b" : "#136c3a" }}>{blockingCount}</strong>
          <span style={{ color: "#4b5563" }}>Blocking issues</span>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, minWidth: 160 }}>
          <strong style={{ display: "block", fontSize: 28, color: warningCount ? "#8a4b00" : "#136c3a" }}>{warningCount}</strong>
          <span style={{ color: "#4b5563" }}>Warnings</span>
        </div>
        <button
          type="button"
          onClick={loadCounts}
          disabled={isLoading}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "0 16px",
            background: "#ffffff",
            color: "#111827",
            fontWeight: 600,
            cursor: isLoading ? "default" : "pointer",
          }}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      {error ? (
        <div style={{ border: "1px solid #f2b8b5", borderRadius: 8, padding: 14, color: "#a5281b", marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      <section style={{ display: "grid", gap: 10 }}>
        {checklistItems.map((item) => {
          const count = counts[item.key];
          const badge = badgeStyle(count, item.severity);
          return (
            <article
              key={item.key}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 14,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 16 }}>{item.title}</h2>
                <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: 13 }}>List: {item.listTitle}</p>
              </div>
              <span
                style={{
                  border: `1px solid ${badge.borderColor}`,
                  background: badge.background,
                  color: badge.color,
                  borderRadius: 999,
                  minWidth: 42,
                  padding: "6px 10px",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                {isLoading ? "..." : count}
              </span>
            </article>
          );
        })}
      </section>
    </main>
  );
}
