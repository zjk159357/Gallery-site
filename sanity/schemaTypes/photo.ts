import { defineField, defineType } from "sanity";

export const photoType = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true, metadata: ["blurhash", "lqip", "palette"] },
      description: "Upload the final CMS image here. Seed imports can temporarily use legacy paths before assets are uploaded.",
    }),
    defineField({
      name: "legacyId",
      title: "Legacy ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "sourceFilename",
      title: "Source Filename",
      type: "string",
      description: "Keep this stable while the frontend still maps legacy data by filename.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "legacyPublicPath",
      title: "Legacy Public Path",
      type: "string",
      readOnly: true,
      description: "Used by migration scripts and frontend fallback before Sanity image assets are uploaded.",
    }),
    defineField({
      name: "legacyLocalPath",
      title: "Legacy Local Path",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "width", title: "Width", type: "number" }),
        defineField({ name: "height", title: "Height", type: "number" }),
      ],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "camera",
      title: "Camera",
      type: "string",
    }),
    defineField({
      name: "lens",
      title: "Lens",
      type: "string",
    }),
    defineField({
      name: "aperture",
      title: "Aperture",
      type: "string",
    }),
    defineField({
      name: "shutter",
      title: "Shutter",
      type: "string",
    }),
    defineField({
      name: "iso",
      title: "ISO",
      type: "number",
    }),
    defineField({
      name: "focalLength",
      title: "Focal Length",
      type: "string",
    }),
    defineField({
      name: "isFeatured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isHero",
      title: "Homepage Hero",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isHidden",
      title: "Hidden",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 100,
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
      subtitle: "sourceFilename",
      media: "image",
    },
  },
});
