import {defineField, defineType} from 'sanity'

export const regionType = defineType({
  type: 'document',
  name: 'region',
  title: 'Region',
  description: '',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'name',
      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {select: {title: 'name'}},
})
