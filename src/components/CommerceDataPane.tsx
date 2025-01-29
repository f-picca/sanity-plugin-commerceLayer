import {ArrowTopRightIcon, BasketIcon} from '@sanity/icons'
import {Box, Button, Card, Heading, Inline, Label, Stack, Text} from '@sanity/ui'
import React, {useEffect, useState} from 'react'

import {getClSkuDashboardLink, getSkuCommerceData, SkuCommerceData} from '../commercelayer'

export default function CommerceDataPane({props}): React.JSX.Element {
  const [skuCommerceData, setSkuCommerceData] = useState<SkuCommerceData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openSkuInCommerceLayer = () => {
    const externalUrl = getClSkuDashboardLink(props.value.commerceLayerId)
    window.open(externalUrl, '_blank', 'noopener,noreferrer')
  }

  const openSellingLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSkuCommerceData(props.value.commerceLayerId)
        if (result) setSkuCommerceData(result)
      } catch (err) {
        setError(`Failed to fetch SKU Commerce Data:${err}`)
        return props.renderDefault(props)
      }
    }

    fetchData()
  }, [props, props.value.commerceLayerId])

  if (!props.value.commerceLayerId || props.value?.commerceLayerId.trim() === '')
    return props.renderDefault(props)
  if (error) {
    return (
      <Stack space={4}>
        {props.renderDefault(props)}
        <Text>Error: {error}</Text>
      </Stack>
    )
  }

  return (
    <Stack space={4}>
      {/* Render the default form */}
      {props.renderDefault(props)}
      <Card tone="neutral" border padding={4} radius={2}>
        <Heading as="h2" size={4}>
          Commerce Data
        </Heading>
        <Stack padding={4} space={5}>
          <Box>
            <Stack space={3}>
              <Card />
              <Label size={4}>SKU Availability</Label>
              {Object.keys(skuCommerceData.availability || {}).length === 0 ? (
                <Text style={{background: 'transparent'}}>No Availability Found</Text>
              ) : (
                Object.keys(skuCommerceData.availability).map((key) => (
                  <Card key={key} title={`${key} Availability`} style={{background: 'transparent'}}>
                    <Text size={2}>
                      {key} : {skuCommerceData.availability[key]}
                    </Text>
                  </Card>
                ))
              )}
            </Stack>
          </Box>

          <Box>
            <Stack space={3}>
              <Label size={4}>SKU Prices</Label>
              {Object.keys(skuCommerceData.prices || {}).length === 0 ? (
                <Text>No Prices Found</Text>
              ) : (
                Object.keys(skuCommerceData.prices).map((key) => (
                  <Card key={key} title={`${key} Prices`} style={{background: 'transparent'}}>
                    <Text size={2}>
                      {key} : {skuCommerceData.prices[key].amount} (
                      <span style={{textDecoration: 'line-through'}}>
                        {skuCommerceData.prices[key].compare_at_amount}
                      </span>
                      )
                    </Text>
                  </Card>
                ))
              )}
            </Stack>
          </Box>

          <Box>
            <Stack space={3}>
              <Label size={4}>Share SKU Selling Links</Label>
              {Object.keys(skuCommerceData.links || {}).length === 0 ? (
                <Text>No Links Found</Text>
              ) : (
                <Card title={'SKU selling links'} style={{background: 'transparent'}}>
                  <Inline space={[3, 3, 4]}>
                    {Object.keys(skuCommerceData.links).map((key) => (
                      <Button
                        key={key}
                        icon={BasketIcon}
                        mode="default"
                        text={`Sell in ${key}`}
                        onClick={() => openSellingLink(skuCommerceData.links[key])}
                        aria-label={`Sell SKU in ${key}`}
                      />
                    ))}
                  </Inline>
                </Card>
              )}
            </Stack>
          </Box>

          <Card>
            <Button
              icon={ArrowTopRightIcon}
              text="Open SKU in Commerce Layer"
              width="fill"
              onClick={openSkuInCommerceLayer}
            />
          </Card>
        </Stack>
      </Card>
    </Stack>
  )
}
