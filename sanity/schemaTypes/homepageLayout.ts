import { defineArrayMember, defineField, defineType } from "sanity";

const photoReference = defineArrayMember({
  type: "reference",
  to: [{ type: "photo" }],
  options: {
    disableNew: true,
  },
});

const countItems = (items: unknown[] | undefined) => items?.length ?? 0;

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
        "The three cards below the hero. Card 1 usually keeps /photobalcony. Empty modules keep the automatic fallback layout.",
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
              options: { disableNew: true },
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
      description: "First Landscape carousel. Recommended: 8-24 photos. Leave empty to use category fallback.",
      validation: (Rule) => Rule.max(24).warning("Recommended maximum: 24 photos."),
    }),
    defineField({
      name: "quietPhotos",
      title: "Quiet Square Photos",
      type: "array",
      fieldset: "main",
      of: [photoReference],
      description: "Square grid after Landscape. Recommended: 4-8 photos. Leave empty to use square-photo fallback.",
      validation: (Rule) => Rule.max(8).warning("Recommended maximum: 8 photos."),
    }),
    defineField({
      name: "bannerOnePhoto",
      title: "First Wide Banner",
      type: "reference",
      fieldset: "main",
      to: [{ type: "photo" }],
      options: { disableNew: true },
      description: "Wide banner between the square grid and City carousel.",
    }),
    defineField({
      name: "cityPhotos",
      title: "City Carousel Photos",
      type: "array",
      fieldset: "main",
      of: [photoReference],
      description: "City carousel. Recommended: 8-22 photos. Leave empty to use category fallback.",
      validation: (Rule) => Rule.max(22).warning("Recommended maximum: 22 photos."),
    }),
    defineField({
      name: "plantsHeroPhoto",
      title: "Plants Banner",
      type: "reference",
      fieldset: "plants",
      to: [{ type: "photo" }],
      options: { disableNew: true },
      description: "Wide banner at the start of the Plants section.",
    }),
    defineField({
      name: "plantsCarouselPhotos",
      title: "Plants Carousel Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
      description: "Plants carousel. Recommended: 8-18 photos. Leave empty to use category fallback.",
      validation: (Rule) => Rule.max(18).warning("Recommended maximum: 18 photos."),
    }),
    defineField({
      name: "plantsFeaturePhoto",
      title: "Plants Feature Photo",
      type: "reference",
      fieldset: "plants",
      to: [{ type: "photo" }],
      options: { disableNew: true },
      description: "Single featured photo inside the Plants section. Optional.",
    }),
    defineField({
      name: "plantsStackPhotos",
      title: "Plants Full-width Stack Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
      description: "Full-width photo stack inside Plants. Recommended: 3-6 photos.",
      validation: (Rule) => Rule.max(8).warning("Recommended maximum: 8 photos."),
    }),
    defineField({
      name: "plantsSquarePhotos",
      title: "Plants Square Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
      description: "Square group at the bottom of Plants. Recommended: 4-8 photos.",
      validation: (Rule) => Rule.max(8).warning("Recommended maximum: 8 photos."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      featureCards: "featureCards",
      landscapePhotos: "landscapePhotos",
      quietPhotos: "quietPhotos",
      cityPhotos: "cityPhotos",
      plantsCarouselPhotos: "plantsCarouselPhotos",
      plantsStackPhotos: "plantsStackPhotos",
      plantsSquarePhotos: "plantsSquarePhotos",
    },
    prepare({
      title,
      featureCards,
      landscapePhotos,
      quietPhotos,
      cityPhotos,
      plantsCarouselPhotos,
      plantsStackPhotos,
      plantsSquarePhotos,
    }) {
      const configuredCount =
        countItems(featureCards) +
        countItems(landscapePhotos) +
        countItems(quietPhotos) +
        countItems(cityPhotos) +
        countItems(plantsCarouselPhotos) +
        countItems(plantsStackPhotos) +
        countItems(plantsSquarePhotos);

      return {
        title: title || "Homepage Layout",
        subtitle: configuredCount
          ? `${configuredCount} selected photos across homepage modules`
          : "Empty modules use the automatic fallback layout",
      };
    },
  },
});
