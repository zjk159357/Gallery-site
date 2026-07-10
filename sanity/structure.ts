import type { StructureResolver } from "sanity/structure";
import { PublishingChecklistDashboard } from "./components/PublishingChecklistDashboard";

const photoOrdering = [{ field: "sortOrder", direction: "asc" as const }];
const storyOrdering = [{ field: "publishedAt", direction: "desc" as const }];
const categoryOrdering = [{ field: "sortOrder", direction: "asc" as const }];

const photoList = (
  S: Parameters<StructureResolver>[0],
  title: string,
  filter: string,
  params?: Record<string, unknown>,
) => {
  const list = S.documentTypeList("photo").title(title).filter(filter).defaultOrdering(photoOrdering);
  return params ? list.params(params) : list;
};

const storyList = (S: Parameters<StructureResolver>[0], title: string, filter: string) =>
  S.documentTypeList("story").title(title).filter(filter).defaultOrdering(storyOrdering);

const homepageReferenceFilter = `
  _type == "photo" &&
  count(*[_type == "homepageLayout" && references(^._id)]) > 0
`;

const siteHeroReferenceFilter = `
  _type == "photo" &&
  count(*[_type == "siteSettings" && heroPhoto._ref == ^._id]) > 0
`;

const homepageFeatureCardFilter = `
  _type == "photo" &&
  count(*[_type == "homepageLayout" && ^._id in featureCards[].photo._ref]) > 0
`;

const homepageArrayReferenceFilter = (field: string) => `
  _type == "photo" &&
  count(*[_type == "homepageLayout" && ^._id in ${field}[]._ref]) > 0
`;

const homepageSingleReferenceFilter = (field: string) => `
  _type == "photo" &&
  count(*[_type == "homepageLayout" && ${field}._ref == ^._id]) > 0
`;

const photobalconyReferenceFilter = `
  _type == "photo" &&
  count(*[_type == "photobalconyLayout" && references(^._id)]) > 0
`;

const photobalconyArrayReferenceFilter = (field: string) => `
  _type == "photo" &&
  count(*[_type == "photobalconyLayout" && ^._id in ${field}[]._ref]) > 0
`;

const photobalconySingleReferenceFilter = (field: string) => `
  _type == "photo" &&
  count(*[_type == "photobalconyLayout" && ${field}._ref == ^._id]) > 0
`;

const journalCoverFilter = `
  _type == "photo" &&
  count(*[_type == "story" && coverPhoto._ref == ^._id]) > 0
`;

const journalRelatedFilter = `
  _type == "photo" &&
  count(*[_type == "story" && ^._id in relatedPhotos[]._ref]) > 0
`;

const visibleStoryFilter = `
  _type == "story" &&
  isHidden != true &&
  (!defined(publishedAt) || dateTime(publishedAt) <= dateTime(now()))
`;

const hiddenPhotoUsedByVisibleStoriesFilter = `
  _type == "photo" &&
  isHidden == true &&
  count(*[${visibleStoryFilter} && references(^._id)]) > 0
`;

const hiddenPhotoUsedByPhotobalconyFilter = `
  _type == "photo" &&
  isHidden == true &&
  count(*[_type == "photobalconyLayout" && references(^._id)]) > 0
`;

const homepageLayoutEmptyModulesFilter = `
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
`;

const photobalconyLayoutEmptyModulesFilter = `
  _type == "photobalconyLayout" &&
  (
    !defined(heroPhoto._ref) ||
    !defined(mayPhotos[0]) ||
    !defined(marchPortraitPhotos[0]) ||
    !defined(marchWidePhotos[0]) ||
    !defined(februaryPhotos[0]) ||
    !defined(januaryPhotos[0]) ||
    !defined(winterPhotos[0]) ||
    !defined(summerPhotos[0])
  )
`;

const slugify = (s: string) => {
  const ascii = s.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  if (ascii) return ascii;
  let hash = 0;
  for (let index = 0; index < s.length; index += 1) {
    hash = ((hash << 5) - hash + s.charCodeAt(index)) | 0;
  }
  return `c${(hash >>> 0).toString(36)}`;
};

const categoryPhotoItem = (S: Parameters<StructureResolver>[0], title: string) =>
  S.listItem()
    .id(`category-photos-${slugify(title)}`)
    .title(title)
    .schemaType("photo")
    .child(photoList(S, title, '_type == "photo" && category->title == $category', { category: title }));

const li = (S: Parameters<StructureResolver>[0], id: string) => S.listItem().id(id);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Gallery Studio")
    .items([
      li(S, "publishing-checklist")
        .title("Publishing Checklist")
        .child(
          S.list()
            .title("Publishing Checklist")
            .items([
              li(S, "publishing.overview")
                .title("Overview")
                .child(S.component(PublishingChecklistDashboard).id("publishing-checklist-overview").title("Overview")),
              li(S, "publishing.hidden-homepage-photos")
                .title("Hidden But Used On Homepage")
                .schemaType("photo")
                .child(photoList(S, "Hidden But Used On Homepage", `${homepageReferenceFilter} && isHidden == true`)),
              li(S, "publishing.hidden-photobalcony-photos")
                .title("Hidden But Used On Photobalcony")
                .schemaType("photo")
                .child(photoList(S, "Hidden But Used On Photobalcony", hiddenPhotoUsedByPhotobalconyFilter)),
              li(S, "publishing.hidden-story-photos")
                .title("Hidden But Used By Visible Stories")
                .schemaType("photo")
                .child(photoList(S, "Hidden But Used By Visible Stories", hiddenPhotoUsedByVisibleStoriesFilter)),
              li(S, "publishing.stories-missing-cover")
                .title("Visible Stories Missing Cover")
                .schemaType("story")
                .child(storyList(S, "Visible Stories Missing Cover", `${visibleStoryFilter} && !defined(coverPhoto._ref)`)),
              li(S, "publishing.hidden-stories")
                .title("Stories Hidden From Website")
                .schemaType("story")
                .child(storyList(S, "Stories Hidden From Website", '_type == "story" && isHidden == true')),
              li(S, "publishing.photos-missing-image")
                .title("Photos Missing Image Asset")
                .schemaType("photo")
                .child(photoList(S, "Photos Missing Image Asset", '_type == "photo" && !defined(image.asset._ref)')),
              li(S, "publishing.photos-missing-category")
                .title("Photos Missing Category")
                .schemaType("photo")
                .child(photoList(S, "Photos Missing Category", '_type == "photo" && !defined(category._ref)')),
              li(S, "publishing.multiple-hero-flags")
                .title("Multiple Hero Flag Photos")
                .schemaType("photo")
                .child(
                  photoList(
                    S,
                    "Multiple Hero Flag Photos",
                    '_type == "photo" && isHero == true && count(*[_type == "photo" && isHero == true]) > 1',
                  ),
                ),
              li(S, "publishing.empty-homepage-modules")
                .title("Homepage Layout Empty Modules")
                .schemaType("homepageLayout")
                .child(
                  S.documentTypeList("homepageLayout")
                    .title("Homepage Layout Empty Modules")
                    .filter(homepageLayoutEmptyModulesFilter),
                ),
              li(S, "publishing.empty-photobalcony-modules")
                .title("Photobalcony Layout Empty Modules")
                .schemaType("photobalconyLayout")
                .child(
                  S.documentTypeList("photobalconyLayout")
                    .title("Photobalcony Layout Empty Modules")
                    .filter(photobalconyLayoutEmptyModulesFilter),
                ),
            ]),
        ),
      li(S, "photo-placement")
        .title("Photo Placement")
        .child(
          S.list()
            .title("Photo Placement")
            .items([
              li(S, "photo-placement.all-visible")
                .title("All Visible Website Photos")
                .schemaType("photo")
                .child(photoList(S, "All Visible Website Photos", '_type == "photo" && isHidden != true')),
              li(S, "photo-placement.hidden")
                .title("Hidden From Website")
                .schemaType("photo")
                .child(photoList(S, "Hidden From Website", '_type == "photo" && isHidden == true')),
              S.divider(),
              li(S, "photo-placement.homepage")
                .title("Homepage")
                .child(
                  S.list()
                    .title("Homepage")
                    .items([
                      li(S, "photo-placement.homepage.settings")
                        .title("Hero Settings")
                        .schemaType("siteSettings")
                        .child(
                          S.document()
                            .schemaType("siteSettings")
                            .documentId("siteSettings-main")
                            .title("Hero Settings"),
                        ),
                      li(S, "photo-placement.homepage.hero-photo")
                        .title("Current Hero Photo")
                        .schemaType("photo")
                        .child(photoList(S, "Current Hero Photo", siteHeroReferenceFilter)),
                      li(S, "photo-placement.homepage.layout")
                        .title("Homepage Layout Editor")
                        .schemaType("homepageLayout")
                        .child(
                          S.document()
                            .schemaType("homepageLayout")
                            .documentId("homepageLayout-main")
                            .title("Homepage Layout Editor"),
                        ),
                      S.divider(),
                      li(S, "photo-placement.homepage.feature-cards")
                        .title("Feature Cards")
                        .schemaType("photo")
                        .child(photoList(S, "Feature Cards", homepageFeatureCardFilter)),
                      li(S, "photo-placement.homepage.landscape")
                        .title("Landscape Carousel")
                        .schemaType("photo")
                        .child(photoList(S, "Landscape Carousel", homepageArrayReferenceFilter("landscapePhotos"))),
                      li(S, "photo-placement.homepage.quiet")
                        .title("Quiet Square Grid")
                        .schemaType("photo")
                        .child(photoList(S, "Quiet Square Grid", homepageArrayReferenceFilter("quietPhotos"))),
                      li(S, "photo-placement.homepage.banner-one")
                        .title("First Wide Banner")
                        .schemaType("photo")
                        .child(photoList(S, "First Wide Banner", homepageSingleReferenceFilter("bannerOnePhoto"))),
                      li(S, "photo-placement.homepage.city")
                        .title("City Carousel")
                        .schemaType("photo")
                        .child(photoList(S, "City Carousel", homepageArrayReferenceFilter("cityPhotos"))),
                      li(S, "photo-placement.homepage.plants-banner")
                        .title("Plants Banner")
                        .schemaType("photo")
                        .child(photoList(S, "Plants Banner", homepageSingleReferenceFilter("plantsHeroPhoto"))),
                      li(S, "photo-placement.homepage.plants-carousel")
                        .title("Plants Carousel")
                        .schemaType("photo")
                        .child(photoList(S, "Plants Carousel", homepageArrayReferenceFilter("plantsCarouselPhotos"))),
                      li(S, "photo-placement.homepage.plants-feature")
                        .title("Plants Feature")
                        .schemaType("photo")
                        .child(photoList(S, "Plants Feature", homepageSingleReferenceFilter("plantsFeaturePhoto"))),
                      li(S, "photo-placement.homepage.plants-stack")
                        .title("Plants Full-width Stack")
                        .schemaType("photo")
                        .child(photoList(S, "Plants Full-width Stack", homepageArrayReferenceFilter("plantsStackPhotos"))),
                      li(S, "photo-placement.homepage.plants-squares")
                        .title("Plants Square Group")
                        .schemaType("photo")
                        .child(photoList(S, "Plants Square Group", homepageArrayReferenceFilter("plantsSquarePhotos"))),
                    ]),
                ),
              li(S, "photo-placement.photobalcony")
                .title("Photobalcony")
                .child(
                  S.list()
                    .title("Photobalcony")
                    .items([
                      li(S, "photo-placement.photobalcony.layout")
                        .title("Photobalcony Layout Editor")
                        .schemaType("photobalconyLayout")
                        .child(
                          S.document()
                            .schemaType("photobalconyLayout")
                            .documentId("photobalconyLayout-main")
                            .title("Photobalcony Layout Editor"),
                        ),
                      S.divider(),
                      li(S, "photo-placement.photobalcony.all")
                        .title("All Photobalcony Photos")
                        .schemaType("photo")
                        .child(photoList(S, "All Photobalcony Photos", photobalconyReferenceFilter)),
                      li(S, "photo-placement.photobalcony.hero")
                        .title("Hero")
                        .schemaType("photo")
                        .child(photoList(S, "Photobalcony Hero", photobalconySingleReferenceFilter("heroPhoto"))),
                      li(S, "photo-placement.photobalcony.may")
                        .title("May 2025 Carousel")
                        .schemaType("photo")
                        .child(photoList(S, "May 2025 Carousel", photobalconyArrayReferenceFilter("mayPhotos"))),
                      li(S, "photo-placement.photobalcony.march-portraits")
                        .title("March 2025 Portrait Row")
                        .schemaType("photo")
                        .child(
                          photoList(
                            S,
                            "March 2025 Portrait Row",
                            photobalconyArrayReferenceFilter("marchPortraitPhotos"),
                          ),
                        ),
                      li(S, "photo-placement.photobalcony.march-wide")
                        .title("March 2025 Carousel")
                        .schemaType("photo")
                        .child(photoList(S, "March 2025 Carousel", photobalconyArrayReferenceFilter("marchWidePhotos"))),
                      li(S, "photo-placement.photobalcony.february")
                        .title("Feb 2025 Carousel")
                        .schemaType("photo")
                        .child(photoList(S, "Feb 2025 Carousel", photobalconyArrayReferenceFilter("februaryPhotos"))),
                      li(S, "photo-placement.photobalcony.january")
                        .title("Jan 2025 Grid")
                        .schemaType("photo")
                        .child(photoList(S, "Jan 2025 Grid", photobalconyArrayReferenceFilter("januaryPhotos"))),
                      li(S, "photo-placement.photobalcony.winter")
                        .title("Nov - Dec 2024 Grid")
                        .schemaType("photo")
                        .child(photoList(S, "Nov - Dec 2024 Grid", photobalconyArrayReferenceFilter("winterPhotos"))),
                      li(S, "photo-placement.photobalcony.summer")
                        .title("July - Aug 2024 Stack")
                        .schemaType("photo")
                        .child(photoList(S, "July - Aug 2024 Stack", photobalconyArrayReferenceFilter("summerPhotos"))),
                    ]),
                ),
              li(S, "photo-placement.journal")
                .title("Journal")
                .child(
                  S.list()
                    .title("Journal")
                    .items([
                      li(S, "photo-placement.journal.cover")
                        .title("Story Cover Photos")
                        .schemaType("photo")
                        .child(photoList(S, "Story Cover Photos", journalCoverFilter)),
                      li(S, "photo-placement.journal.related")
                        .title("Story Related Photos")
                        .schemaType("photo")
                        .child(photoList(S, "Story Related Photos", journalRelatedFilter)),
                      li(S, "photo-placement.journal.no-story")
                        .title("Photos Without Stories")
                        .schemaType("photo")
                        .child(
                          photoList(
                            S,
                            "Photos Without Stories",
                            '_type == "photo" && count(*[_type == "story" && references(^._id)]) == 0',
                          ),
                        ),
                    ]),
                ),
            ]),
        ),
      li(S, "homepage")
        .title("Homepage")
        .child(
          S.list()
            .title("Homepage")
            .items([
              li(S, "homepage.layout")
                .title("Homepage Layout")
                .schemaType("homepageLayout")
                .child(
                  S.document()
                    .schemaType("homepageLayout")
                    .documentId("homepageLayout-main")
                    .title("Homepage Layout"),
                ),
              li(S, "homepage.site-settings")
                .title("Site Settings / Hero")
                .schemaType("siteSettings")
                .child(S.document().schemaType("siteSettings").documentId("siteSettings-main").title("Site Settings / Hero")),
              li(S, "homepage.hero-flagged")
                .title("Hero Flagged Photos")
                .schemaType("photo")
                .child(photoList(S, "Hero Flagged Photos", '_type == "photo" && isHero == true')),
              li(S, "homepage.visible")
                .title("Visible Homepage Photos")
                .schemaType("photo")
                .child(photoList(S, "Visible Homepage Photos", '_type == "photo" && isHidden != true')),
              li(S, "homepage.hidden")
                .title("Hidden From Website")
                .schemaType("photo")
                .child(photoList(S, "Hidden From Website", '_type == "photo" && isHidden == true')),
            ]),
        ),
      li(S, "homepage-sections")
        .title("Homepage Sections")
        .child(
          S.list()
            .title("Homepage Sections")
            .items([
              li(S, "homepage-sections.all-categories")
                .title("All Categories")
                .schemaType("category")
                .child(S.documentTypeList("category").title("All Categories").defaultOrdering(categoryOrdering)),
              S.divider(),
              categoryPhotoItem(S, "\u5c71\u91ce"),
              categoryPhotoItem(S, "\u5efa\u7b51"),
              categoryPhotoItem(S, "\u65e5\u51fa\u65e5\u843d"),
              categoryPhotoItem(S, "\u68ee\u6797"),
              categoryPhotoItem(S, "\u6cb3\u6d41"),
              categoryPhotoItem(S, "\u6d77\u6d0b"),
              categoryPhotoItem(S, "\u77f3\u5858\u5ea6\u5047\u533a"),
              categoryPhotoItem(S, "\u82b1\u6735"),
            ]),
        ),
      li(S, "journal")
        .title("Journal")
        .child(
          S.list()
            .title("Journal")
            .items([
              li(S, "journal.all-stories")
                .title("All Stories")
                .schemaType("story")
                .child(storyList(S, "All Stories", '_type == "story"')),
              li(S, "journal.stories-missing-cover")
                .title("Stories Missing Cover")
                .schemaType("story")
                .child(storyList(S, "Stories Missing Cover", '_type == "story" && !defined(coverPhoto._ref)')),
              li(S, "journal.photos-with-stories")
                .title("Photos With Stories")
                .schemaType("photo")
                .child(
                  photoList(
                    S,
                    "Photos With Stories",
                    '_type == "photo" && count(*[_type == "story" && references(^._id)]) > 0',
                  ),
                ),
              li(S, "journal.photos-without-stories")
                .title("Photos Without Stories")
                .schemaType("photo")
                .child(
                  photoList(
                    S,
                    "Photos Without Stories",
                    '_type == "photo" && count(*[_type == "story" && references(^._id)]) == 0',
                  ),
                ),
            ]),
        ),
      li(S, "photo-safety")
        .title("Photo Safety")
        .child(
          S.list()
            .title("Photo Safety")
            .items([
              li(S, "photo-safety.all-photos")
                .title("All Photos")
                .schemaType("photo")
                .child(S.documentTypeList("photo").title("All Photos").defaultOrdering(photoOrdering)),
              li(S, "photo-safety.visible-photos")
                .title("Visible Photos")
                .schemaType("photo")
                .child(photoList(S, "Visible Photos", '_type == "photo" && isHidden != true')),
              li(S, "photo-safety.hidden-photos")
                .title("Hidden Photos")
                .schemaType("photo")
                .child(photoList(S, "Hidden Photos", '_type == "photo" && isHidden == true')),
              li(S, "photo-safety.photos-referenced-by-stories")
                .title("Photos Referenced By Stories")
                .schemaType("photo")
                .child(
                  photoList(
                    S,
                    "Photos Referenced By Stories",
                    '_type == "photo" && count(*[_type == "story" && references(^._id)]) > 0',
                  ),
                ),
              li(S, "photo-safety.photos-referenced-by-homepage")
                .title("Photos Used On Homepage")
                .schemaType("photo")
                .child(photoList(S, "Photos Used On Homepage", homepageReferenceFilter)),
              li(S, "photo-safety.hidden-homepage-photos")
                .title("Hidden But Used On Homepage")
                .schemaType("photo")
                .child(photoList(S, "Hidden But Used On Homepage", `${homepageReferenceFilter} && isHidden == true`)),
            ]),
        ),
    ]);
