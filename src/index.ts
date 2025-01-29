import React from "react";
import {
  defineField,
  definePlugin,
  InputProps,
  isObjectInputProps,
} from "sanity";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { markdownSchema } from "sanity-plugin-markdown";

import { CreateSkuSyncAfterPublishAction } from "./actions/createSkuSyncAfterPublishAction";
import { SyncWithCommerceLayerDocumentBadge } from "./badges/syncWithCommerceLayerDocumentBadge";
import CommerceDataPane from "./components/CommerceDataPane";
import { schemaTypes } from "./schemaTypes";

export const commerceLayerPlugin = definePlugin({
  name: "sanity-studio-commercelayer-plugin",
  document: {
    actions: (prev, context) => {
      // Check the schema type for 'sku' and customize publish action
      if (context.schemaType === "sku") {
        const updatedPrev = prev.map((action) => {
          if (action.action === "publish") {
            return CreateSkuSyncAfterPublishAction(action, context);
          }
          return action;
        });

        return [...updatedPrev];
      }

      // Default actions for all other schema types
      return prev;
    },
    badges: (prev, context) => {
      if (context.schemaType === "sku") {
        return [...prev, SyncWithCommerceLayerDocumentBadge];
      }
      return prev;
    },
  },
  form: {
    components: {
      input: (props: InputProps) => {
        if (props.id === "root" && isObjectInputProps(props)) {
          if (props.value?._type === "sku") {
            return React.createElement(CommerceDataPane, { props });
          }
          return props.renderDefault(props);
        }
        return props.renderDefault(props);
      },
    },
  },
  plugins: [
    markdownSchema(),
    internationalizedArray({
      languages: [
        { id: "en", title: "English" },
        { id: "it", title: "Italian" },
      ],
      defaultLanguages: ["en"],
      fieldTypes: [
        "string",
        "text",
        defineField({
          name: "localizedPages",
          type: "reference",
          to: [{ type: "page" }],
        }),
      ],
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
