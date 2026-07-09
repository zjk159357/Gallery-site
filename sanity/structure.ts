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

const categoryPhotoItem = (S: Parameters<StructureResolver>[0], title: string) =>
  S.listItem()
    .title(title)
    .schemaType("photo")
    .child(photoList(S, title, '_type == "photo" && category->title == $category', { category: title }));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Gallery Studio")
    .items([
      S.listItem()
        .title("Homepage")
        .child(
          S.list()
            .title("Homepage")
            .items([
              S.listItem()
                .title("Site Settings / Hero")
                .schemaType("siteSettings")
                .child(S.document().schemaType("siteSettings").documentId("siteSettings-main").title("Site Settings / Hero")),
              S.listItem()
                .title("Hero Flagged Photos")
                .schemaType("photo")
                .child(photoList(S, "Hero Flagged Photos", '_type == "photo" && isHero == true')),
              S.listItem()
                .title("Visible Homepage Photos")
                .schemaType("photo")
                .child(photoList(S, "Visible Homepage Photos", '_type == "photo" && isHidden != true')),
              S.listItem()
                .title("Hidden From Website")
                .schemaType("photo")
                .child(photoList(S, "Hidden From Website", '_type == "photo" && isHidden == true')),
            ]),
        ),
      S.listItem()
        .title("Homepage Sections")
        .child(
          S.list()
            .title("Homepage Sections")
            .items([
              S.listItem()
                .title("All Categories")
                .schemaType("category")
                .child(S.documentTypeList("category").title("All Categories").defaultOrdering(categoryOrdering)),
              S.divider(),
              categoryPhotoItem(S, "山野"),
              categoryPhotoItem(S, "建筑"),
              categoryPhotoItem(S, "日出日落"),
              categoryPhotoItem(S, "森林"),
              categoryPhotoItem(S, "河流"),
              categoryPhotoItem(S, "海洋"),
              categoryPhotoItem(S, "石塘度假区"),
              categoryPhotoItem(S, "花朵"),
            ]),
        ),
      S.listItem()
        .title("Journal")
        .child(
          S.list()
            .title("Journal")
            .items([
              S.listItem()
                .title("All Stories")
                .schemaType("story")
                .child(storyList(S, "All Stories", '_type == "story"')),
              S.listItem()
                .title("Stories Missing Cover")
                .schemaType("story")
                .child(storyList(S, "Stories Missing Cover", '_type == "story" && !defined(coverPhoto._ref)')),
              S.listItem()
                .title("Photos With Stories")
                .schemaType("photo")
                .child(
                  photoList(
                    S,
                    "Photos With Stories",
                    '_type == "photo" && count(*[_type == "story" && references(^._id)]) > 0',
                  ),
                ),
              S.listItem()
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
      S.listItem()
        .title("Photo Safety")
        .child(
          S.list()
            .title("Photo Safety")
            .items([
              S.listItem()
                .title("All Photos")
                .schemaType("photo")
                .child(S.documentTypeList("photo").title("All Photos").defaultOrdering(photoOrdering)),
              S.listItem()
                .title("Visible Photos")
                .schemaType("photo")
                .child(photoList(S, "Visible Photos", '_type == "photo" && isHidden != true')),
              S.listItem()
                .title("Hidden Photos")
                .schemaType("photo")
                .child(photoList(S, "Hidden Photos", '_type == "photo" && isHidden == true')),
              S.listItem()
                .title("Photos Referenced By Stories")
                .schemaType("photo")
                .child(
                  photoList(
                    S,
                    "Photos Referenced By Stories",
                    '_type == "photo" && count(*[_type == "story" && references(^._id)]) > 0',
                  ),
                ),
            ]),
        ),
    ]);
