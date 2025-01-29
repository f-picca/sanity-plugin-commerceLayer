import {useToast} from '@sanity/ui'
import React, {useEffect} from 'react'
import {DocumentActionComponent, DocumentActionsContext, useClient} from 'sanity'

import {Product} from '../../sanity.types'
import {syncSku} from '../commercelayer'

export const CreateSkuSyncAfterPublishAction = (
  originalPublishAction: DocumentActionComponent,
  context: DocumentActionsContext,
) => {
  const SyncSkuWithCLAndPublish: DocumentActionComponent = (props) => {
    const toast = useToast()
    const client = useClient({apiVersion: '2024-12-01'})
    const [product, setProduct] = React.useState<Product>({} as Product)
    const {draft} = props
    const originalResult = originalPublishAction(props)

    useEffect(() => {
      client
        .fetch(`*[_type == "product" && references($documentId)][0]`, {
          documentId: context.documentId,
        })
        .then((result) => {
          const _product: Product = result
          setProduct(_product)
        })
        .catch((error) => {
          console.error('Error fetching product:', error)
        })
    }, [client, draft?._id])

    return {
      ...originalResult,
      label: 'Sync SKU and Publish',
      onHandle: async () => {
        if (originalResult && typeof originalResult.onHandle === 'function') {
          originalResult.onHandle()
        }
        const publishedSku = (
          await client.fetch(
            `*[_id == $documentId]{
              ...,
              shippingCategory->{
                code,
                name
              }
            }`,
            {
              documentId: context.documentId,
            },
          )
        )[0]

        const result = await syncSku(publishedSku, product)
        if (result.success) {
          if (result.sku.commerceLayerId)
            client
              .patch(context.documentId!)
              .set({commerceLayerId: result.sku.commerceLayerId})
              .commit()
          toast.push({
            status: 'success',
            title: `${result.sku.code} ${(result.operation as string).toUpperCase()}`,
            description: `operation was succesful`,
          })
        } else {
          toast.push({
            status: 'error',
            title: `${result.sku.code} ${(result.operation as string).toUpperCase()}`,
            description: `operation failed`,
          })
        }
      },
    }
  }

  return SyncSkuWithCLAndPublish
}
