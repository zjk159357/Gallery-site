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
  title: "影像阳台布局",
  type: "document",
  fieldsets: [
    {
      name: "hero",
      title: "主视觉",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "spring",
      title: "春季模块",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "winter",
      title: "冬季模块",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "summer",
      title: "夏季模块",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "名称",
      type: "string",
      initialValue: "影像阳台布局",
      readOnly: true,
    }),
    defineField({
      name: "heroPhoto",
      title: "主视觉照片",
      type: "reference",
      fieldset: "hero",
      to: [{ type: "photo" }],
      options: { disableNew: true },
      description: "/photobalcony 顶部的全宽图片。",
    }),
    defineField({
      name: "mayPhotos",
      title: "2025 年 5 月轮播",
      type: "array",
      fieldset: "spring",
      of: [photoReference],
      description: "位于“2025 年 5 月”标题下方的主轮播。",
      validation: (Rule) => Rule.max(12).warning("建议最多 12 张照片。"),
    }),
    defineField({
      name: "marchPortraitPhotos",
      title: "2025 年 3 月竖幅照片行",
      type: "array",
      fieldset: "spring",
      of: [photoReference],
      description: "位于“2025 年 3 月”标题下方的横向竖幅照片行。",
      validation: (Rule) => Rule.max(12).warning("建议最多 12 张照片。"),
    }),
    defineField({
      name: "marchWidePhotos",
      title: "2025 年 3 月轮播",
      type: "array",
      fieldset: "spring",
      of: [photoReference],
      description: "位于 3 月竖幅照片行之后的宽幅轮播。",
      validation: (Rule) => Rule.max(12).warning("建议最多 12 张照片。"),
    }),
    defineField({
      name: "februaryPhotos",
      title: "2025 年 2 月轮播",
      type: "array",
      fieldset: "winter",
      of: [photoReference],
      description: "位于“2025 年 2 月”标题下方的轮播。",
      validation: (Rule) => Rule.max(12).warning("建议最多 12 张照片。"),
    }),
    defineField({
      name: "januaryPhotos",
      title: "2025 年 1 月网格",
      type: "array",
      fieldset: "winter",
      of: [photoReference],
      description: "位于“2025 年 1 月”标题下方的网格。",
      validation: (Rule) => Rule.max(12).warning("建议最多 12 张照片。"),
    }),
    defineField({
      name: "winterPhotos",
      title: "2024 年 11–12 月网格",
      type: "array",
      fieldset: "winter",
      of: [photoReference],
      description: "位于“2024 年 11–12 月”标题下方的宽幅网格。",
      validation: (Rule) => Rule.max(12).warning("建议最多 12 张照片。"),
    }),
    defineField({
      name: "summerPhotos",
      title: "2024 年 7–8 月堆叠",
      type: "array",
      fieldset: "summer",
      of: [photoReference],
      description: "/photobalcony 底部的最终纵向堆叠。",
      validation: (Rule) => Rule.max(12).warning("建议最多 12 张照片。"),
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
        title: title || "影像阳台布局",
        subtitle: heroTitle
          ? `主视觉：${heroTitle} / 模块照片 ${configuredCount} 张`
          : `模块照片 ${configuredCount} 张`,
        media: heroImage,
      };
    },
  },
});
