import {defineField, defineType} from 'sanity'

export const skuType = defineType({
  type: 'document',
  name: 'sku',
  title: 'SKU',
  description: '',
  fields: [
    defineField({
      name: 'code',
      type: 'string',
      title: 'Code',
      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'string',
      title: 'Slug',
      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'size', type: 'string', title: 'Size', hidden: false}),
    defineField({
      name: 'shippingCategory',
      type: 'reference',
      to: [{type: 'shippingCategory'}],
      title: 'Shipping Category',
      validation: (Rule) => Rule.required(),
      hidden: false,
    }),
    defineField({
      name: 'commerceLayerId',
      type: 'string',
      title: 'Commerce Layer ID',
      hidden: true,
    }),
  ],
  preview: {select: {title: 'code'}},
})
