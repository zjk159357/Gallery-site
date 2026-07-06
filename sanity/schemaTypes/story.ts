import { defineArrayMember, defineField, defineType } from "sanity";

export const storyType = defineType({
  name: "story",
  title: "Story",
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
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "coverPhoto",
      title: "Cover Photo",
      type: "reference",
      to: [{ type: "photo" }],
    }),
    defineField({
      name: "relatedPhotos",
      title: "Related Photos",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "photo" }],
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "excerpt",
      media: "coverPhoto.image",
    },
  },
});
