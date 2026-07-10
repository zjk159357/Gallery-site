import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Short paragraph shown on the section card. Plain text only — keep under ~200 characters.",
    }),
    defineField({
      name: "coverPhoto",
      title: "Cover Photo",
      type: "reference",
      to: [{ type: "photo" }],
      description:
        "Hero image for the category section card. Hidden photos still surface here, so prefer a visible photo unless you are staging a new section.",
      options: { disableNew: true },
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 100,
      description: "Lower numbers appear earlier in the category sidebar and homepage sections.",
    }),
    defineField({
      name: "isVisible",
      title: "Visible",
      type: "boolean",
      initialValue: true,
      description: "When off, the section is hidden from the homepage and category navigation, but the document is kept.",
    }),
  ],
  orderings: [
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
