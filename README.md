# sanity-plugin-commercelayer

> This is a **Sanity Studio v3** plugin that integrates Commerce Layer features into Sanity Studio.

## Overview

The `sanity-plugin-commerceLayerPlugin` allows you to seamlessly integrate Commerce Layer functionalities into your Sanity Studio. This plugin provides tools to manage SKUs, synchronize data with Commerce Layer, and display commerce-related information directly within the Sanity Studio interface.

## Features

- **SKU Management**: Create, update, and manage SKUs within Sanity Studio.
- **Commerce Layer Synchronization**: Automatically sync SKUs with Commerce Layer upon publishing.
- **Commerce Data Display**: View SKU availability, prices, and selling links directly in the Sanity Studio.

## Installation

To install the plugin, run the following command:

```sh
npm install sanity-plugin-commerceLayerPlugin
```

## Usage

Add the plugin to your `sanity.config.ts` (or .js) file:

```ts
import {defineConfig} from 'sanity'
import {commerceLayerPlugin} from 'sanity-plugin-commerceLayerPlugin'

export default defineConfig({
  //...
  plugins: [commerceLayerPlugin()],
})
```

## Configuration

Ensure you have the following environment variables set in your project:

- `SANITY_STUDIO_C11R_INTEGRATION_ID`
- `SANITY_STUDIO_C11R_INTEGRATION_SECRET`
- `SANITY_STUDIO_C11R_INTEGRATION_SLUG`
- `SANITY_STUDIO_C11R_DASHBOARD_BASE_URL`
- `SANITY_STUDIO_C11R_SALES_CHANNEL_ID`

These variables are required for authenticating and interacting with the Commerce Layer API.

## Development & Testing

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit) with default configuration for build & watch scripts.

To develop and test the plugin with hot-reload in the studio, follow the instructions in [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio).

## License

[MIT](LICENSE) © Fabrizio Picca
