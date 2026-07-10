import type { StructureResolver } from "sanity/structure";

const photoOrdering = [{ field: "sortOrder", direction: "asc" as const }];
const storyOrdering = [{ field: "publishedAt", direction: "desc" as const }];
const categoryOrdering = [{ field: "sortOrder", direction: "asc" as const }];

const photoList = (
  S: Parameters<StructureResolver>[0],
  title: string,
  filter: string,
  params?: Record<string, string>,
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
