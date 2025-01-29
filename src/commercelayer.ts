/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
import { authenticate } from "@commercelayer/js-auth";
import CommerceLayer, {
  Sku as ClSku,
  ListResponse,
  ShippingCategory,
} from "@commercelayer/sdk";

import { Product, Sku } from "../sanity.types";

const SANITY_STUDIO_REFERENCE_ORIGIN = "SANITY_STUDIO";
const C11R_INTEGRATION_ID = process.env.SANITY_STUDIO_C11R_INTEGRATION_ID!;
const C11R_INTEGRATION_SECRET =
  process.env.SANITY_STUDIO_C11R_INTEGRATION_SECRET!;
const C11R_INTEGRATION_SLUG = process.env.SANITY_STUDIO_C11R_INTEGRATION_SLUG!;
const C11R_DASHBOARD_BASE_URL =
  process.env.SANITY_STUDIO_C11R_DASHBOARD_BASE_URL!;
const C11R_DASHBOARD_SALES_CHANNEL_ID =
  process.env.SANITY_STUDIO_C11R_SALES_CHANNEL_ID!;
let cachedToken: string | null = null;
let tokenExpiry: number | null = null; // Store the token expiry timestamp

const getToken = async (): Promise<string> => {
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

  // If there's a valid token and it's not expired, return it
  if (cachedToken && tokenExpiry && currentTime < tokenExpiry) {
    return cachedToken;
  }

  // Generate a new token
  const auth = await authenticate("client_credentials", {
    clientId: C11R_INTEGRATION_ID,
    clientSecret: C11R_INTEGRATION_SECRET,
  });

  // Cache the token and set the expiry (current time + expiresIn)
  cachedToken = auth.accessToken;
  tokenExpiry = currentTime + auth.expiresIn - 60; // Subtract 60 seconds as a buffer

  return cachedToken;
};

const getClClient = (token: string) => {
  return CommerceLayer({
    organization: C11R_INTEGRATION_SLUG,
    accessToken: token,
  });
};

enum SyncOperation {
  create = "create",
  update = "update",
}

type SyncResult = {
  operation: SyncOperation;
  success: boolean;
  message: string;
  sku: Sku;
};

/*
 * upsert sku to Commerce Layer
 */
export const syncSku = async (
  _sku: any | null,
  product: Product,
): Promise<SyncResult> => {
  if (!_sku) throw new Error("missing Sanity SKU");

  const cl = getClClient(await getToken());

  const languageEntry = product.name!.find((entry) => entry._key === "en");
  const productName = languageEntry ? languageEntry.value : "Unnamed Product";

  // First, check if SKU exists
  const result = await cl.skus.list({ filters: { code_eq: _sku.code! } });

  try {
    if (result.length > 0) {
      // If the SKU exists, update it
      const updatedSku = await cl.skus.update({
        id: result[0].id,
        code: _sku.code,
        name: productName,
        reference_origin: SANITY_STUDIO_REFERENCE_ORIGIN,
        shipping_category: cl.shipping_categories.relationship(
          _sku.shippingCategory.code,
        ),
      });

      return {
        operation: SyncOperation.update,
        success: true,
        message: `SKU ${updatedSku.code} successfully updated`,
        sku: { ..._sku, commerceLayerId: updatedSku.id },
      };
    }
    // Otherwise, create it
    const createdSku = await cl.skus.create({
      code: _sku.code!,
      name: productName!,
      reference_origin: SANITY_STUDIO_REFERENCE_ORIGIN,
      shipping_category: cl.shipping_categories.relationship(
        _sku.shippingCategory.code,
      ),
      //shipping_category: c,
    });

    return {
      operation: SyncOperation.create,
      success: true,
      message: `SKU ${createdSku.code} successfully created`,
      sku: { ..._sku, commerceLayerId: createdSku.id },
    };
  } catch (err) {
    return {
      operation:
        result.length > 0 ? SyncOperation.update : SyncOperation.create,
      success: false,
      message: `Failed to ${
        result.length > 0 ? "update" : "create"
      } SKU: ${_sku.code}. Error: ${err}`,
      sku: _sku!,
    };
  }
};

export type SkuCommerceData = {
  availability: Record<string, string>;
  prices: Record<
    string,
    {
      compare_at_amount: string | null | undefined;
      amount: string | null | undefined;
    }
  >;
  links: Record<string, string>;
};

export const getSkuCommerceData = async (
  _sku: string,
): Promise<SkuCommerceData | undefined> => {
  const cl = getClClient(await getToken());
  const sku = await cl.skus.retrieve(_sku, {
    include: [
      "prices",
      "prices.price_list",
      "stock_items",
      "stock_items.stock_location",
    ],
  });

  if (sku) {
    const commerceData: SkuCommerceData = {
      availability: sku.stock_items!.reduce(
        (acc, item) => {
          if (item.stock_location?.name && item.quantity !== undefined) {
            acc[item.stock_location.name] = item.quantity.toString(); // Add stock location name and quantity as key-value pair
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
      prices: sku.prices!.reduce(
        (acc, price) => {
          if (price.price_list?.name) {
            acc[price.price_list.name] = {
              compare_at_amount: price.formatted_compare_at_amount,
              amount: price.formatted_amount,
            };
          }
          return acc;
        },
        {} as Record<
          string,
          {
            compare_at_amount: string | null | undefined;
            amount: string | null | undefined;
          }
        >,
      ),
      links: await getShoppingLinks(sku),
    };
    return commerceData;
  }
  throw new Error(`No SKU found for identifier: ${_sku}`);
};

const getShoppingLinks = async (
  sku: ClSku,
): Promise<Record<string, string>> => {
  if (!sku.prices || sku.prices.length === 0) {
    return {};
  }

  const availablePricelists = sku.prices.map((price) => price.price_list?.id);

  const cl = getClClient(await getToken());
  const availableMarkets = await cl.markets.list({
    filters: { price_list_in: availablePricelists },
  });

  // Use Promise.all to handle async operations in map
  const links = await Promise.all(
    availableMarkets.map(async (market) => {
      const link = await cl.links.create({
        client_id: C11R_DASHBOARD_SALES_CHANNEL_ID,
        name: "Link from Sanity",
        scope: `market:id:${market.id}`,
        item: cl.skus.relationship(sku.id),
      });

      // Ensure the market name and link URL are strings
      if (market.name && link.url) {
        return { [market.name]: link.url };
      }

      // Skip if data is incomplete
      return null;
    }),
  );

  // Filter out null results
  const validLinks = links.filter(
    (link): link is Record<string, string> => link !== null,
  );

  // Reduce the array of records into a single object
  const combinedLinks = validLinks.reduce(
    (acc, record) => {
      return { ...acc, ...record };
    },
    {} as Record<string, string>,
  );

  return combinedLinks;
};

export const getShippingCategories = async (): Promise<
  ListResponse<ShippingCategory>
> => {
  const cl = getClClient(await getToken());
  const shippingCategories = await cl.shipping_categories.list();
  return shippingCategories;
};

export const getClSkuDashboardLink = (skuId: Sku): string => {
  const clAppSkuUrl = `${
    C11R_DASHBOARD_BASE_URL + C11R_INTEGRATION_SLUG
  }/apps/skus/list/${skuId}`;

  return clAppSkuUrl;
};
