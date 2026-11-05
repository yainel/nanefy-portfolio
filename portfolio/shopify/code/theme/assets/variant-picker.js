/**
 * <variant-picker> keeps the product form in sync with the selected options:
 * hidden variant id, price, button state and the ?variant= URL (so the page can be shared or reloaded).
 * Variant data is rendered once by Liquid as JSON, so no extra network request is needed.
 */
class VariantPicker extends HTMLElement {
  connectedCallback() {
    this.variants = JSON.parse(this.querySelector('[data-variants]').textContent);
    this.form = this.closest('form');
    this.section = this.closest('.product');
    this.addEventListener('change', () => this.update());
  }

  get selectedOptions() {
    return [...this.querySelectorAll('fieldset')].map(
      (fieldset) => fieldset.querySelector('input:checked')?.value
    );
  }

  update() {
    const options = this.selectedOptions;
    const variant = this.variants.find((v) => v.options.every((value, i) => value === options[i]));
    const button = this.form.querySelector('[data-add-button]');

    if (!variant) {
      button.disabled = true;
      button.textContent = button.dataset.textUnavailable;
      return;
    }

    this.form.querySelector('[data-variant-id]').value = variant.id;
    this.section.querySelector('[data-price]').textContent = formatMoney(variant.price);
    button.disabled = !variant.available;
    button.textContent = variant.available ? button.dataset.textAdd : button.dataset.textSoldOut;

    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);

    // Other components (sticky add-to-cart, pickup availability) can listen for this
    this.dispatchEvent(new CustomEvent('variant:change', { bubbles: true, detail: { variant } }));
  }
}

function formatMoney(cents) {
  const currency = window.Shopify?.currency?.active ?? 'USD';
  return new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency }).format(cents / 100);
}

if (!customElements.get('variant-picker')) customElements.define('variant-picker', VariantPicker);
