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
      title: "Top feature cards / 顶部三张卡片",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "main",
      title: "Main homepage sections / 首页主体",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "plants",
      title: "Plants section / Plants 区块",
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
        "Hero 下方的三张卡片。第 1 张通常保留 /photobalcony 链接；留空时继续使用旧的自动布局。",
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
              description: "例如 /photobalcony。不需要跳转时留空。",
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
      validation: (Rule) => Rule.max(3).warning("首页目前只显示 3 张顶部卡片。"),
    }),
    defineField({
      name: "landscapePhotos",
      title: "Landscape Carousel Photos",
      type: "array",
      fieldset: "main",
      of: [photoReference],
      description: "首页第一个 Landscape 横向轮播。建议 8-24 张；留空时按分类自动选择。",
      validation: (Rule) => Rule.max(24).warning("Landscape 轮播建议不超过 24 张，太多会增加首页加载压力。"),
    }),
    defineField({
      name: "quietPhotos",
      title: "Quiet Square Photos",
      type: "array",
      fieldset: "main",
      of: [photoReference],
      description: "Landscape 后面的方图区域。建议 4-8 张；留空时使用当前方图兜底。",
      validation: (Rule) => Rule.max(8).warning("Quiet Square 区域建议不超过 8 张。"),
    }),
    defineField({
      name: "bannerOnePhoto",
      title: "First Wide Banner",
      type: "reference",
      fieldset: "main",
      to: [{ type: "photo" }],
      options: { disableNew: true },
      description: "方图区域和 City 轮播之间的第一张全宽横幅图。",
    }),
    defineField({
      name: "cityPhotos",
      title: "City Carousel Photos",
      type: "array",
      fieldset: "main",
      of: [photoReference],
      description: "City 横向轮播。建议 8-22 张；留空时按石塘度假区/建筑分类自动选择。",
      validation: (Rule) => Rule.max(22).warning("City 轮播建议不超过 22 张。"),
    }),
    defineField({
      name: "plantsHeroPhoto",
      title: "Plants Banner",
      type: "reference",
      fieldset: "plants",
      to: [{ type: "photo" }],
      options: { disableNew: true },
      description: "Plants 标题下面最先出现的全宽横幅图。",
    }),
    defineField({
      name: "plantsCarouselPhotos",
      title: "Plants Carousel Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
      description: "Plants 区块里的横向轮播。建议 8-18 张；留空时按花朵/森林分类自动选择。",
      validation: (Rule) => Rule.max(18).warning("Plants 轮播建议不超过 18 张。"),
    }),
    defineField({
      name: "plantsFeaturePhoto",
      title: "Plants Feature Photo",
      type: "reference",
      fieldset: "plants",
      to: [{ type: "photo" }],
      options: { disableNew: true },
      description: "Plants 区块里单独突出的 feature 图。可以留空。",
    }),
    defineField({
      name: "plantsStackPhotos",
      title: "Plants Full-width Stack Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
      description: "Plants 区块中一张接一张的大图。建议 3-6 张。",
      validation: (Rule) => Rule.max(8).warning("Plants 大图堆叠建议不超过 8 张。"),
    }),
    defineField({
      name: "plantsSquarePhotos",
      title: "Plants Square Photos",
      type: "array",
      fieldset: "plants",
      of: [photoReference],
      description: "Plants 区块底部的方图组。建议 4-8 张。",
      validation: (Rule) => Rule.max(8).warning("Plants 方图组建议不超过 8 张。"),
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
