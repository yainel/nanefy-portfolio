/**
 * Hydrogen product route: /products/:handle
 * Server-rendered from the Storefront API at the edge (Oxygen), with the selected variant
 * read from the URL so shared links open on the right size and grind.
 */
import { useLoaderData } from "@remix-run/react";
import { Image, Money, CartForm, Analytics, getSelectedProductOptions } from "@shopify/hydrogen";

export const meta = ({ data }) => [
  { title: `${data?.product.title ?? "Coffee"} | Aroma & Hoja` },
  { name: "description", content: data?.product.seo.description ?? "" },
];

export async function loader({ params, request, context }) {
  const { product } = await context.storefront.query(PRODUCT_QUERY, {
    variables: { handle: params.handle, selectedOptions: getSelectedProductOptions(request) },
    cache: context.storefront.CacheShort(),
  });
  if (!product?.id) throw new Response("Product not found", { status: 404 });
  return { product };
}

export default function Product() {
  const { product } = useLoaderData();
  const variant = product.selectedOrFirstAvailableVariant;
  const notes = product.tastingNotes ? JSON.parse(product.tastingNotes.value) : [];

  return (
    <article className="product">
      <Image data={variant.image ?? product.featuredImage} sizes="(min-width: 45em) 50vw, 100vw" loading="eager" />

      <div className="product__info">
        <h1>{product.title}</h1>
        <Money data={variant.price} />
        {notes.length > 0 && (
          <ul className="product__notes">
            {notes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        )}

        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={{ lines: [{ merchandiseId: variant.id, quantity: 1 }] }}
        >
          <button type="submit" disabled={!variant.availableForSale}>
            {variant.availableForSale ? "Add to cart" : "Sold out"}
          </button>
        </CartForm>

        <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      </div>

      <Analytics.ProductView
        data={{
          products: [{
            id: product.id,
            title: product.title,
            price: variant.price.amount,
            vendor: product.vendor,
            variantId: variant.id,
            variantTitle: variant.title,
            quantity: 1,
          }],
        }}
      />
    </article>
  );
}

const PRODUCT_QUERY = `#graphql
  query Product(
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      descriptionHtml
      seo { description }
      featuredImage { url altText width height }
      tastingNotes: metafield(namespace: "custom", key: "tasting_notes") { value }
      selectedOrFirstAvailableVariant(
        selectedOptions: $selectedOptions
        ignoreUnknownOptions: true
        caseInsensitiveMatch: true
      ) {
        id
        title
        availableForSale
        price { amount currencyCode }
        image { url altText width height }
      }
    }
  }
`;
