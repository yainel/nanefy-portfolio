/**
 * <predictive-search>: instant results from Shopify's Predictive Search API.
 * - Debounced, and older requests are aborted so slow responses never overwrite newer ones
 * - Searches titles, product types, SKUs and tags
 * - Combobox pattern: arrow keys move through results, Enter opens one, Escape closes
 *
 * Markup: <predictive-search><input type="search" role="combobox" aria-controls="search-results">
 *         <div id="search-results" role="listbox" data-results hidden></div></predictive-search>
 */
class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input[type="search"]');
    this.results = this.querySelector('[data-results]');
    this.input.addEventListener('input', debounce(() => this.search(), 250));
    this.input.addEventListener('keydown', (event) => this.onKeydown(event));
    this.input.addEventListener('blur', () => setTimeout(() => this.close(), 150));
  }

  async search() {
    const query = this.input.value.trim();
    if (query.length < 2) return this.close();

    this.controller?.abort();
    this.controller = new AbortController();
    const params = new URLSearchParams({
      q: query,
      'resources[type]': 'product,collection',
      'resources[limit]': '4',
      'resources[options][fields]': 'title,product_type,variants.sku,tag',
    });

    try {
      const response = await fetch(`${window.Shopify.routes.root}search/suggest.json?${params}`, {
        signal: this.controller.signal,
      });
      const { resources } = await response.json();
      this.render(resources.results, query);
    } catch (error) {
      if (error.name !== 'AbortError') this.close();
    }
  }

  render({ products = [], collections = [] }, query) {
    this.results.replaceChildren();
    const items = [
      ...products.map((p) => ({ title: p.title, url: p.url, meta: p.price, image: p.image })),
      ...collections.map((c) => ({ title: c.title, url: c.url, meta: 'Collection' })),
    ];

    items.forEach((item, index) => {
      const option = document.createElement('a');
      option.href = item.url;
      option.id = `search-option-${index}`;
      option.setAttribute('role', 'option');
      option.className = 'search-result';
      if (item.image) option.append(Object.assign(new Image(64, 64), { src: `${item.image}&width=128`, alt: '', loading: 'lazy' }));
      option.append(highlight(item.title, query), Object.assign(document.createElement('small'), { textContent: item.meta }));
      this.results.append(option);
    });

    if (!items.length) {
      this.results.append(Object.assign(document.createElement('p'), { textContent: `No results for “${query}”` }));
    }
    this.active = -1;
    this.results.hidden = false;
    this.input.setAttribute('aria-expanded', 'true');
  }

  onKeydown(event) {
    const options = [...this.results.querySelectorAll('[role="option"]')];
    if (event.key === 'Escape') return this.close();
    if (!options.length || !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Enter') return options[this.active]?.click();
    this.active = (this.active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === this.active)));
    this.input.setAttribute('aria-activedescendant', options[this.active].id);
  }

  close() {
    this.results.hidden = true;
    this.input.setAttribute('aria-expanded', 'false');
    this.input.removeAttribute('aria-activedescendant');
  }
}

// Wraps the matching part in <mark> using text nodes only (no innerHTML, no injection)
function highlight(text, query) {
  const span = document.createElement('span');
  const start = text.toLowerCase().indexOf(query.toLowerCase());
  if (start < 0) {
    span.textContent = text;
    return span;
  }
  const mark = document.createElement('mark');
  mark.textContent = text.slice(start, start + query.length);
  span.append(text.slice(0, start), mark, text.slice(start + query.length));
  return span;
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

if (!customElements.get('predictive-search')) customElements.define('predictive-search', PredictiveSearch);
