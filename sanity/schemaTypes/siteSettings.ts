import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fieldsets: [
    {
      name: "identity",
      title: "Site identity",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "hero",
      title: "Homepage hero",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "about",
      title: "About page",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "social",
      title: "Social & contact",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      fieldset: "identity",
      description: "Used in browser tab and the homepage <title>. Also exposed as the document title in the Studio list.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroPhoto",
      title: "Homepage Hero Photo",
      type: "reference",
      to: [{ type: "photo" }],
      fieldset: "hero",
      description:
        "Primary photo shown above the fold. Takes precedence over any photo with the Hero Flag. Hidden photos will surface a validation warning but can still be saved.",
      options: { disableNew: true },
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          if (!value?._ref) return true;
          const client = context.getClient({ apiVersion: "2025-02-19" });
          const doc = await client.fetch(
            `*[_id == $id][0]{ isHidden, title }`,
            { id: value._ref },
          );
          if (!doc) return "Referenced photo no longer exists.";
          if (doc.isHidden) {
            return `“${doc.title}” is currently hidden — the homepage will ignore it and fall back to the Hero Flag/default photo until you unhide it or pick another photo.`;
          }
          return true;
        }),
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "string",
      fieldset: "hero",
      description: "Reserved hero copy field. The current homepage hero is image-only and does not display this text yet.",
    }),
    defineField({
      name: "aboutName",
      title: "About Name",
      type: "string",
      fieldset: "about",
      description: "Name shown at the top of /about. Falls back to the author name in the static fallback.",
    }),
    defineField({
      name: "aboutLocation",
      title: "About Location",
      type: "string",
      fieldset: "about",
      description: "Short location line, e.g. “浙江台州 / 上海”.",
    }),
    defineField({
      name: "aboutBio",
      title: "About Bio",
      type: "array",
      fieldset: "about",
      of: [defineArrayMember({ type: "block" })],
      description: "Body text for /about. Paragraphs render as separate blocks.",
    }),
    defineField({
      name: "gear",
      title: "Gear",
      type: "array",
      fieldset: "about",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Label",
              type: "string",
              description: "Short label, e.g. “机身”.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              description: "Gear item, e.g. “Sony A7M4”.",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "value" },
          },
        }),
      ],
      description: "Camera / gear list shown on /about.",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      fieldset: "social",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "value",
              title: "Display Value",
              type: "string",
              description: "User-facing text, e.g. “@gallery”.",
            }),
            defineField({
              name: "href",
              title: "URL",
              type: "url",
              description: "Full URL including protocol.",
              validation: (Rule) =>
                Rule.uri({
                  scheme: ["http", "https", "mailto", "tel"],
                  allowRelative: false,
                }),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        }),
      ],
      description: "Shown on /about and as footer icons. The first link is treated as the primary contact.",
    }),
  ],
  preview: {
    select: {
      title: "siteTitle",
      heroTitle: "heroPhoto.title",
      heroImage: "heroPhoto.image",
      hiddenHero: "heroPhoto.isHidden",
      subtitle: "heroSubtitle",
    },
    prepare({ title, heroTitle, heroImage, hiddenHero, subtitle }) {
      const heroLabel = heroTitle
        ? hiddenHero
          ? `Hero: ${heroTitle} (hidden)`
          : `Hero: ${heroTitle}`
        : "Hero not set";
      const subtitleParts = [heroLabel, subtitle].filter(Boolean);
      return {
        title: title || "Site Settings",
        subtitle: subtitleParts.join(" · "),
        media: heroImage,
      };
    },
  },
});
