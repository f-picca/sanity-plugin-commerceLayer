import {defineField, defineType} from 'sanity'

export const productType = defineType({
  type: 'document',
  name: 'product',
  title: 'Product',
  description: '',
  fields: [
    defineField({
      name: 'name',
      type: 'internationalizedArrayString',
      title: 'Name',
      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'code', type: 'string', title: 'Code', hidden: false}),
    defineField({
      name: 'baseProductId',
      type: 'string',
      title: 'Base Product ID',
      hidden: false,
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayString',
      title: 'Description',
      hidden: false,
    }),
    defineField({
      name: 'images',
      type: 'array',
      of: [{type: 'image'}],
      title: 'Images',
      hidden: false,
    }),
    defineField({
      name: 'skus',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'sku'}]}],
      title: 'SKUs',
      hidden: false,
    }),
  ],
  preview: {
    select: {title: 'name', code: 'code', images: 'images'},
    prepare(selection) {
      const {title, code, images} = selection
      return {
        title: title[0].value,
        subtitle: `Product Code = ${code}`,
        media: images[0],
      }
    },
  },
})
