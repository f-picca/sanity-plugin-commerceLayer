import {ShippingCategory} from '@commercelayer/sdk'
import React, {ChangeEvent} from 'react'
import {useEffect} from 'react'
import {getShippingCategories} from '../commercelayer'
import {Select} from '@sanity/ui'
import {set, unset} from 'sanity'

export default function ShippingCategorySelector(props) {
  const {onChange, value = '', id, focusRef, onBlur, onFocus, readOnly} = props

  const [shippingCategories, setShippingCategories] = React.useState<ShippingCategory[]>([])

  useEffect(() => {
    getShippingCategories().then((result) => {
      setShippingCategories(result)
    })
  }, [])

  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const selectedValue = event.target.value
    onChange(selectedValue ? set(selectedValue) : unset())
  }

  return (
    <Select onChange={handleChange}>
      <option value="" disabled selected={value == '' ? true : false}>
        -- Select a Shipping Category --
      </option>
      {shippingCategories.map((shippingCategory) => (
        <option
          key={shippingCategory.id}
          value={shippingCategory.id}
          selected={value == shippingCategory.id ? true : false}
        >
          {shippingCategory.name}
        </option>
      ))}
    </Select>
  )
}
