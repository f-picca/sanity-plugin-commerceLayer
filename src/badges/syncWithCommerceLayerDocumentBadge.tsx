import {DocumentBadgeDescription} from 'sanity'

export function SyncWithCommerceLayerDocumentBadge(props): DocumentBadgeDescription {
  if (props.published && props.published.commerceLayerId) {
    return {
      label: 'SYNCHED WITH CL',
      title: 'This SKU is synchronized with a SKU in Commerce Layer',
      color: 'success', // Valid predefined value
    }
  }
  return {
    label: 'NOT SYNCHED WITH CL',
    title: 'This SKU is not synchronized with a SKU in Commerce Layer',
    color: 'warning', // Valid predefined value
  }
}
