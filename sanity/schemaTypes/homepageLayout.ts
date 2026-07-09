import { defineArrayMember, defineField, defineType } from "sanity";

const photoReference = defineArrayMember({
  type: "reference",
  to: [{ type: "photo" }],
});

export const homepageLayoutType = defineType({
  name: "homepageLayout",
  title: "Homepage Layout",
  type: "document",
  fieldsets: [
    {
      name: "feature",
      title: "Top feature cards",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "main",
      title: "Main homepage sections",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "plants",
      title: "Plants section",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Homepage Layout",
      readOnly: true,
    }),
    defineField({
      name: "featureCards",
      title: "Feature Cards",
      type: "array",
      fieldset: "feature",
      description:
        "The three cards below the hero. Card 1 can keep /photobalcony as its link. Leave empty to use the current fallback layout.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Card Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "photo",
              title: "Card Photo",
              type: "reference",
              to: [{ type: "photo" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Optional Link",
              type: "string",
              description: "Example: /photobalcony. Leave blank when the card should not navigate.",
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "href",
              media: "photo.image",
            },
          },
        }),
      ],
      validation: (Rule) => Rule.max(3).warning("The homepage currently shows three feature cards."),
    }),
    defineField({
      name: "landscapePhotos",
      title: "Landscape Carousel Photos",
      type: "array",
      fieldset: "main",
      of: [photoReference],
      description: "Photos for the first Landscape carousel. Leave empty to use category-based fallback.",
    }),
    defineField({
      name: "quietPhotos",
      title: "Quiet Square Photos",
      type: "array",
      fieldset: "main",
      of: [photoReference],
      description: "Square grid after Landscape. Leave empty to use the current square-photo fallback.",
    }),
    defineField({
      name: "bannerOnePhoto",
      title: "First Wide Banner",
      type: "reference",
      fieldset: "main",
      to: [{ type: "photo" }],
      description: "The wide image between the square grid and City section.",
    }),
    defineField({
      name: "cityPhotos",
      title: "City Carousel Photos",
      type: "array",
      fieldset: "main",
      of: [photoReference],
      description: "Photos for the City carousel. Leave empty to use category-based fallback.",
    }),
    defineField({
      name: "plantsHeroPhoto",
      title: "Plants Banner",
      type: "reference",
      fieldset: "plants",
      to: [{ type: "photo" }],
      description: "The wide banner at the start of the Plants section.",
    }),
    defineField({
      name: "plantsCarouselPhotos",
      title: "Plants Carousel Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
    }),
    defineField({
      name: "plantsFeaturePhoto",
      title: "Plants Feature Photo",
      type: "reference",
      fieldset: "plants",
      to: [{ type: "photo" }],
    }),
    defineField({
      name: "plantsStackPhotos",
      title: "Plants Full-width Stack Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
    }),
    defineField({
      name: "plantsSquarePhotos",
      title: "Plants Square Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Homepage Layout",
        subtitle: "Controls the visible homepage photo modules",
      };
    },
  },
});
