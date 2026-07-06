import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroPhoto",
      title: "Homepage Hero Photo",
      type: "reference",
      to: [{ type: "photo" }],
    }),
    defineField({
      name: "aboutName",
      title: "About Name",
      type: "string",
    }),
    defineField({
      name: "aboutLocation",
      title: "About Location",
      type: "string",
    }),
    defineField({
      name: "aboutBio",
      title: "About Bio",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
        }),
      ],
    }),
    defineField({
      name: "gear",
      title: "Gear",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "value",
            },
          },
        }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "href", title: "URL", type: "url" }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "value",
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "siteTitle",
    },
  },
});
