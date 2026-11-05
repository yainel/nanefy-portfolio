/**
 * <cart-drawer>: AJAX cart that never reloads the page.
 * Adds and quantity changes go through the Cart API, and the same request asks Shopify to
 * re-render the cart-drawer section (Section Rendering API), so the HTML is always correct
 * for discounts, selling plans and translations without duplicating that logic in JS.
 */
const SECTION_ID = 'cart-drawer';

class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (event) => {
      const line = event.target.closest('[data-line]');
      if (line) this.change(line.dataset.line, Number(line.dataset.quantity));
      if (event.target.closest('[data-close]')) this.close();
    });
    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });

    // Progressive enhancement: product forms still work without JavaScript
    document.addEventListener('submit', (event) => {
      if (!event.target.matches('form[action*="/cart/add"]')) return;
      event.preventDefault();
      this.add(new FormData(event.target), event.submitter);
    });
  }

  async add(formData, button) {
    formData.append('sections', SECTION_ID);
    formData.append('sections_url', window.location.pathname);
    button?.setAttribute('aria-busy', 'true');
    try {
      const data = await this.request('cart/add.js', formData);
      this.render(data.sections[SECTION_ID]);
      this.open();
    } catch (error) {
      this.showError(error.message);
      this.open();
    } finally {
      button?.removeAttribute('aria-busy');
    }
  }

  async change(lineKey, quantity) {
    const formData = new FormData();
    formData.append('id', lineKey);
    formData.append('quantity', String(Math.max(0, quantity)));
    formData.append('sections', SECTION_ID);
    try {
      const data = await this.request('cart/change.js', formData);
      this.render(data.sections[SECTION_ID]);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { itemCount: data.item_count } }));
    } catch (error) {
      this.showError(error.message);
    }
  }

  async request(path, body) {
    const response = await fetch(`${window.Shopify.routes.root}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
    });
    const data = await response.json();
    // 422 = not enough stock, the message comes translated from Shopify
    if (!response.ok) throw new Error(data.description || data.message);
    return data;
  }

  render(html) {
    const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('cart-drawer');
    if (fresh) this.innerHTML = fresh.innerHTML;
  }

  showError(message) {
    const error = this.querySelector('[data-error]');
    error.textContent = message;
    error.hidden = false;
  }

  open() {
    this.lastFocus = document.activeElement;
    this.setAttribute('aria-hidden', 'false');
    this.classList.add('is-open');
    document.body.classList.add('overflow-hidden');
    this.querySelector('[role="dialog"]').focus();
  }

  close() {
    this.setAttribute('aria-hidden', 'true');
    this.classList.remove('is-open');
    document.body.classList.remove('overflow-hidden');
    this.lastFocus?.focus();
  }
}

if (!customElements.get('cart-drawer')) customElements.define('cart-drawer', CartDrawer);
