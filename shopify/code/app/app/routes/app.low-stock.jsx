/**
 * Embedded admin page: "Low stock" for Aroma & Hoja.
 * Lists every variant under a threshold (sorted by quantity) and lets the merchant tag
 * products for restock in one click. Built on the Shopify Remix app template + Polaris.
 */
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams } from "@remix-run/react";
import { Page, Card, IndexTable, Badge, Text, Button, RangeSlider, BlockStack, EmptyState } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

const LOW_STOCK_QUERY = `#graphql
  query LowStock($first: Int!, $query: String!) {
    productVariants(first: $first, query: $query, sortKey: INVENTORY_QUANTITY) {
      nodes {
        id
        title
        sku
        inventoryQuantity
        product { id title tags }
      }
    }
  }`;

const TAG_PRODUCT = `#graphql
  mutation TagForRestock($id: ID!) {
    tagsAdd(id: $id, tags: ["restock"]) {
      userErrors { field message }
    }
  }`;

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const threshold = Number(new URL(request.url).searchParams.get("threshold") ?? 10);

  const response = await admin.graphql(LOW_STOCK_QUERY, {
    variables: { first: 50, query: `inventory_quantity:<${threshold}` },
  });
  const { data } = await response.json();
  return json({ threshold, variants: data.productVariants.nodes });
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const productId = (await request.formData()).get("productId");

  const response = await admin.graphql(TAG_PRODUCT, { variables: { id: productId } });
  const { data } = await response.json();
  const errors = data.tagsAdd.userErrors;
  return json({ ok: errors.length === 0, errors }, { status: errors.length ? 422 : 200 });
}

export default function LowStock() {
  const { threshold, variants } = useLoaderData();
  const [, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  const rows = variants.map((variant, index) => {
    const tagged = variant.product.tags.includes("restock");
    return (
      <IndexTable.Row id={variant.id} key={variant.id} position={index}>
        <IndexTable.Cell>
          <Text as="span" fontWeight="semibold">{variant.product.title}</Text> · {variant.title}
        </IndexTable.Cell>
        <IndexTable.Cell>{variant.sku}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={variant.inventoryQuantity <= 0 ? "critical" : "warning"}>
            {variant.inventoryQuantity <= 0 ? "Out of stock" : `${variant.inventoryQuantity} left`}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <fetcher.Form method="post">
            <input type="hidden" name="productId" value={variant.product.id} />
            <Button submit disabled={tagged} loading={fetcher.formData?.get("productId") === variant.product.id}>
              {tagged ? "Tagged" : "Tag for restock"}
            </Button>
          </fetcher.Form>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page title="Low stock" subtitle="Variants running out, lowest first">
      <BlockStack gap="400">
        <Card>
          <RangeSlider
            label={`Show variants with fewer than ${threshold} units`}
            min={1}
            max={50}
            value={threshold}
            onChange={(value) => setSearchParams({ threshold: String(value) })}
          />
        </Card>
        <Card padding="0">
          {variants.length ? (
            <IndexTable
              resourceName={{ singular: "variant", plural: "variants" }}
              itemCount={variants.length}
              selectable={false}
              headings={[{ title: "Product" }, { title: "SKU" }, { title: "Stock" }, { title: "" }]}
            >
              {rows}
            </IndexTable>
          ) : (
            <EmptyState heading="Everything is in stock" image="">
              <p>No variants are under {threshold} units.</p>
            </EmptyState>
          )}
        </Card>
      </BlockStack>
    </Page>
  );
}
