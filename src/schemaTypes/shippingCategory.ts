import {defineField, defineType} from 'sanity'

export const shippingCategoryType = defineType({
  type: 'document',
  name: 'shippingCategory',
  title: 'Shipping Category',
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
      name: 'name',
      type: 'string',
      title: 'Name',
      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {select: {title: 'name'}},
})
