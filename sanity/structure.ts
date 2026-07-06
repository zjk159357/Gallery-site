import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Gallery CMS")
    .items([
      S.listItem()
        .title("Site Settings")
        .schemaType("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings-main").title("Site Settings")),
      S.divider(),
      S.listItem()
        .title("Photos")
        .schemaType("photo")
        .child(S.documentTypeList("photo").title("Photos").defaultOrdering([{ field: "sortOrder", direction: "asc" }])),
      S.listItem()
        .title("Stories")
        .schemaType("story")
        .child(S.documentTypeList("story").title("Stories").defaultOrdering([{ field: "publishedAt", direction: "desc" }])),
      S.listItem()
        .title("Categories")
        .schemaType("category")
        .child(S.documentTypeList("category").title("Categories").defaultOrdering([{ field: "sortOrder", direction: "asc" }])),
    ]);
