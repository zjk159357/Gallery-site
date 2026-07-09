import { defineField, defineType } from "sanity";

export const photoType = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  fieldsets: [
    {
      name: "placement",
      title: "Website placement",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "identity",
      title: "Photo identity",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "metadata",
      title: "Camera metadata",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "safety",
      title: "Safety and migration",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      fieldset: "identity",
      description: "Displayed in the lightbox, photo page, sitemap title data, and Studio previews.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      fieldset: "identity",
      options: { source: "title", maxLength: 96 },
      description: "Stable URL part for the photo detail/lightbox page. Avoid changing after sharing a link.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      fieldset: "identity",
      options: { hotspot: true, metadata: ["blurhash", "lqip", "palette"] },
      description:
        "Upload or replace the photo asset here. Whether it appears on the homepage is controlled by Hidden, Category, and Sort Order below.",
    }),
    defineField({
      name: "category",
      title: "Homepage Section / Category",
      type: "reference",
      fieldset: "placement",
      to: [{ type: "category" }],
      description:
        "Controls which homepage section this photo can enter. Current sections are based mainly on category plus image shape.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      fieldset: "placement",
      initialValue: 100,
      description:
        "Lower numbers appear earlier inside the current category/homepage ordering. Use this before deleting or reuploading photos.",
    }),
    defineField({
      name: "isHidden",
      title: "Hide From Website",
      type: "boolean",
      fieldset: "placement",
      initialValue: false,
      description:
        "Hides this photo from the live website without deleting the document. This is the safer choice when a story may reference the photo.",
    }),
    defineField({
      name: "isHero",
      title: "Homepage Hero Flag",
      type: "boolean",
      fieldset: "placement",
      initialValue: false,
      description:
        "Fallback hero marker. The main hero image is controlled in Homepage > Site Settings / Hero. Keep at most one flagged photo.",
    }),
    defineField({
      name: "isFeatured",
      title: "Featured Flag (reserved)",
      type: "boolean",
      fieldset: "placement",
      initialValue: false,
      description: "Reserved for a future featured-module editor. The current homepage layout does not rely on this flag.",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      fieldset: "identity",
      description: "Used as a secondary ordering fallback after Sort Order.",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      fieldset: "identity",
    }),
    defineField({
      name: "camera",
      title: "Camera",
      type: "string",
      fieldset: "metadata",
    }),
    defineField({
      name: "lens",
      title: "Lens",
      type: "string",
      fieldset: "metadata",
    }),
    defineField({
      name: "aperture",
      title: "Aperture",
      type: "string",
      fieldset: "metadata",
    }),
    defineField({
      name: "shutter",
      title: "Shutter",
      type: "string",
      fieldset: "metadata",
    }),
    defineField({
      name: "iso",
      title: "ISO",
      type: "number",
      fieldset: "metadata",
    }),
    defineField({
      name: "focalLength",
      title: "Focal Length",
      type: "string",
      fieldset: "metadata",
    }),
    defineField({
      name: "sourceFilename",
      title: "Source Filename",
      type: "string",
      fieldset: "safety",
      description:
        "Keep this stable while the frontend still maps a few fixed homepage positions by filename.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "legacyId",
      title: "Legacy ID",
      type: "string",
      fieldset: "safety",
      readOnly: true,
    }),
    defineField({
      name: "legacyPublicPath",
      title: "Legacy Public Path",
      type: "string",
      fieldset: "safety",
      readOnly: true,
      description: "Used by migration scripts and frontend fallback before Sanity image assets are uploaded.",
    }),
    defineField({
      name: "legacyLocalPath",
      title: "Legacy Local Path",
      type: "string",
      fieldset: "safety",
      readOnly: true,
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      type: "object",
      fieldset: "safety",
      readOnly: true,
      fields: [
        defineField({ name: "width", title: "Width", type: "number" }),
        defineField({ name: "height", title: "Height", type: "number" }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      filename: "sourceFilename",
      category: "category.title",
      hidden: "isHidden",
      hero: "isHero",
      order: "sortOrder",
      media: "image",
    },
    prepare({ title, filename, category, hidden, hero, order, media }) {
      const status = hidden ? "Hidden" : hero ? "Hero flag" : "Visible";
      const details = [category, status, order != null ? `Order ${order}` : null, filename].filter(Boolean).join(" / ");

      return {
        title,
        subtitle: details,
        media,
      };
    },
  },
});
