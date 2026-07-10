import { defineArrayMember, defineField, defineType } from "sanity";

export const storyType = defineType({
  name: "story",
  title: "Story",
  type: "document",
  fieldsets: [
    {
      name: "identity",
      title: "Story identity",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "cover",
      title: "Cover & related photos",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "body",
      title: "Body",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "safety",
      title: "Safety",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      fieldset: "identity",
      description: "Story headline. Also used to generate the slug.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      fieldset: "identity",
      options: { source: "title", maxLength: 96 },
      description:
        "URL part for /stories/<slug>. The frontend currently routes both this slug and a fallback derived from the cover photo filename.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      fieldset: "identity",
      description:
        "Used for ordering on /journal and the sitemap lastmod. Setting a future date hides the story from listings until that time.",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      fieldset: "identity",
      description: "Short summary shown on /journal cards and in the lightbox entry. Keep under about 140 characters.",
    }),
    defineField({
      name: "coverPhoto",
      title: "Cover Photo",
      type: "reference",
      to: [{ type: "photo" }],
      fieldset: "cover",
      description:
        "Primary photo shown on /journal and as the story header. Stories missing a cover are listed separately in Journal > Stories Missing Cover.",
      options: { disableNew: true },
    }),
    defineField({
      name: "relatedPhotos",
      title: "Related Photos",
      type: "array",
      fieldset: "cover",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "photo" }],
          options: { disableNew: true },
        }),
      ],
      description: "Optional gallery that appears at the bottom of the story. Hidden photos still appear here when referenced.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      fieldset: "body",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              description: "Required for accessibility when this image is inline in the story body.",
            }),
          ],
        }),
      ],
      description: "Rich text body. Inline images are uploaded here and do not need to exist as separate photo documents.",
    }),
    defineField({
      name: "isHidden",
      title: "Hide From Website",
      type: "boolean",
      fieldset: "safety",
      initialValue: false,
      description: "Hide this story from /journal, the sitemap and any cross-references without deleting the document.",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [
        { field: "isHidden", direction: "asc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      excerpt: "excerpt",
      publishedAt: "publishedAt",
      hidden: "isHidden",
      coverImage: "coverPhoto.image",
    },
    prepare({ title, excerpt, publishedAt, hidden, coverImage }) {
      const dateLabel = publishedAt ? new Date(publishedAt).toISOString().slice(0, 10) : "No date";
      const status = hidden ? "Hidden" : "Visible";
      const excerptLabel = excerpt ? `"${excerpt.slice(0, 60)}${excerpt.length > 60 ? "..." : ""}"` : null;

      return {
        title,
        subtitle: [dateLabel, status, excerptLabel].filter(Boolean).join(" / "),
        media: coverImage,
      };
    },
  },
});
