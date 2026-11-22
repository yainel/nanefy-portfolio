/**
 * Checkout UI extension: suggest a grinder to customers buying whole-bean coffee.
 * - The merchant picks the product in the checkout editor (variant_id setting)
 * - Hidden when it's already in the cart or the cart has no whole-bean coffee
 * - Uses the Storefront API from checkout (api_access = true in shopify.extension.toml)
 */
import {
  reactExtension,
  BlockStack,
  InlineLayout,
  Image,
  Text,
  Button,
  Banner,
  SkeletonText,
  useApi,
  useCartLines,
  useApplyCartLinesChange,
  useSettings,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

export default reactExtension("purchase.checkout.block.render", () => <GrinderUpsell />);

const VARIANT_QUERY = `query Upsell($id: ID!) {
  node(id: $id) {
    ... on ProductVariant {
      id
      price { amount }
      image { url altText }
      product { title }
    }
  }
}`;

function GrinderUpsell() {
  const { query, i18n } = useApi();
  const { variant_id: variantId } = useSettings();
  const lines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!variantId) return setLoading(false);
    query(VARIANT_QUERY, { variables: { id: variantId } })
      .then(({ data }) => setVariant(data?.node ?? null))
      .finally(() => setLoading(false));
  }, [query, variantId]);

  const alreadyInCart = lines.some((line) => line.merchandise.id === variantId);
  const hasWholeBean = lines.some((line) =>
    line.merchandise.selectedOptions?.some((option) => option.value === "Whole bean")
  );

  if (loading) return <SkeletonText inlineSize="large" />;
  if (!variant || alreadyInCart || !hasWholeBean) return null;

  async function addToOrder() {
    setAdding(true);
    setError("");
    const result = await applyCartLinesChange({ type: "addCartLine", merchandiseId: variant.id, quantity: 1 });
    setAdding(false);
    if (result.type === "error") setError(i18n.translate("upsell.error"));
  }

  return (
    <BlockStack spacing="base">
      <Text size="medium" emphasis="bold">{i18n.translate("upsell.title")}</Text>
      <InlineLayout columns={[64, "fill", "auto"]} spacing="base" blockAlignment="center">
        <Image
          source={variant.image?.url}
          accessibilityDescription={variant.image?.altText ?? variant.product.title}
          border="base"
          borderRadius="base"
          aspectRatio={1}
        />
        <BlockStack spacing="none">
          <Text emphasis="bold">{variant.product.title}</Text>
          <Text appearance="subdued">{i18n.formatCurrency(Number(variant.price.amount))}</Text>
        </BlockStack>
        <Button kind="secondary" loading={adding} onPress={addToOrder}>
          {i18n.translate("upsell.add")}
        </Button>
      </InlineLayout>
      {error && <Banner status="critical">{error}</Banner>}
    </BlockStack>
  );
}
