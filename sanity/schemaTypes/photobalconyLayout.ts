import { defineArrayMember, defineField, defineType } from "sanity";

const photoReference = defineArrayMember({
  type: "reference",
  to: [{ type: "photo" }],
  options: {
    disableNew: true,
  },
});

const countItems = (items: unknown[] | undefined) => items?.length ?? 0;

export const photobalconyLayoutType = defineType({
  name: "photobalconyLayout",
  title: "Photobalcony Layout",
  type: "document",
  fieldsets: [
    {
      name: "hero",
      title: "Hero",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "spring",
      title: "Spring sections",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "winter",
      title: "Winter sections",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "summer",
      title: "Summer sections",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Photobalcony Layout",
      readOnly: true,
    }),
    defineField({
      name: "heroPhoto",
      title: "Hero Photo",
      type: "reference",
      fieldset: "hero",
      to: [{ type: "photo" }],
      options: { disableNew: true },
      description: "Top full-width image on /photobalcony.",
    }),
    defineField({
      name: "mayPhotos",
      title: "May 2025 Carousel",
      type: "array",
      fieldset: "spring",
      of: [photoReference],
      description: "Main carousel under the May 2025 heading.",
      validation: (Rule) => Rule.max(12).warning("Recommended maximum: 12 photos."),
    }),
    defineField({
      name: "marchPortraitPhotos",
      title: "March 2025 Portrait Row",
      type: "array",
      fieldset: "spring",
      of: [photoReference],
      description: "Horizontal row of portrait photos under March 2025.",
      validation: (Rule) => Rule.max(12).warning("Recommended maximum: 12 photos."),
    }),
    defineField({
      name: "marchWidePhotos",
      title: "March 2025 Carousel",
      type: "array",
      fieldset: "spring",
      of: [photoReference],
      description: "Wide carousel after the March portrait row.",
      validation: (Rule) => Rule.max(12).warning("Recommended maximum: 12 photos."),
    }),
    defineField({
      name: "februaryPhotos",
      title: "Feb 2025 Carousel",
      type: "array",
      fieldset: "winter",
      of: [photoReference],
      description: "Carousel under the Feb 2025 heading.",
      validation: (Rule) => Rule.max(12).warning("Recommended maximum: 12 photos."),
    }),
    defineField({
      name: "januaryPhotos",
      title: "Jan 2025 Grid",
      type: "array",
      fieldset: "winter",
      of: [photoReference],
      description: "Grid under the Jan 2025 heading.",
      validation: (Rule) => Rule.max(12).warning("Recommended maximum: 12 photos."),
    }),
    defineField({
      name: "winterPhotos",
      title: "Nov - Dec 2024 Grid",
      type: "array",
      fieldset: "winter",
      of: [photoReference],
      description: "Wide grid under the Nov - Dec 2024 heading.",
      validation: (Rule) => Rule.max(12).warning("Recommended maximum: 12 photos."),
    }),
    defineField({
      name: "summerPhotos",
      title: "July - Aug 2024 Stack",
      type: "array",
      fieldset: "summer",
      of: [photoReference],
      description: "Final vertical stack at the bottom of /photobalcony.",
      validation: (Rule) => Rule.max(12).warning("Recommended maximum: 12 photos."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      heroTitle: "heroPhoto.title",
      heroImage: "heroPhoto.image",
      mayPhotos: "mayPhotos",
      marchPortraitPhotos: "marchPortraitPhotos",
      marchWidePhotos: "marchWidePhotos",
      februaryPhotos: "februaryPhotos",
      januaryPhotos: "januaryPhotos",
      winterPhotos: "winterPhotos",
      summerPhotos: "summerPhotos",
    },
    prepare({
      title,
      heroTitle,
      heroImage,
      mayPhotos,
      marchPortraitPhotos,
      marchWidePhotos,
      februaryPhotos,
      januaryPhotos,
      winterPhotos,
      summerPhotos,
    }) {
      const configuredCount =
        countItems(mayPhotos) +
        countItems(marchPortraitPhotos) +
        countItems(marchWidePhotos) +
        countItems(februaryPhotos) +
        countItems(januaryPhotos) +
        countItems(winterPhotos) +
        countItems(summerPhotos);

      return {
        title: title || "Photobalcony Layout",
        subtitle: heroTitle
          ? `Hero: ${heroTitle} / ${configuredCount} section photos`
          : `${configuredCount} section photos`,
        media: heroImage,
      };
    },
  },
});
