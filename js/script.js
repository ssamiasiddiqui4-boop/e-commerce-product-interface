(() => {
  'use strict';

  const CART_KEY = 'luxemarket-cart-v1';

  /* ------------------------------------------------------------
     Product catalog (demo data)
     ------------------------------------------------------------ */
  const PRODUCTS = [
    { id: 'p01', name: 'Aura Wireless Earbuds', category: 'Audio', price: 59.99, rating: 4.6, reviews: 214, emoji: '🎧' },
    { id: 'p02', name: 'Pulse Over-Ear Headphones', category: 'Audio', price: 89.0, rating: 4.4, reviews: 132, emoji: '🎧' },
    { id: 'p03', name: 'Echo Mini Speaker', category: 'Audio', price: 34.5, rating: 4.2, reviews: 98, emoji: '🔊' },
    { id: 'p04', name: 'Orbit Smartwatch', category: 'Wearables', price: 129.0, rating: 4.7, reviews: 321, emoji: '⌚' },
    { id: 'p05', name: 'Flex Fitness Band', category: 'Wearables', price: 45.0, rating: 4.1, reviews: 156, emoji: '⌚' },
    { id: 'p06', name: 'Horizon Sunglasses', category: 'Accessories', price: 24.99, rating: 4.0, reviews: 64, emoji: '🕶️' },
    { id: 'p07', name: 'Drift Leather Wallet', category: 'Accessories', price: 19.5, rating: 4.3, reviews: 88, emoji: '👛' },
    { id: 'p08', name: 'Nimbus Backpack', category: 'Bags', price: 74.0, rating: 4.8, reviews: 410, emoji: '🎒' },
    { id: 'p09', name: 'Vale Tote Bag', category: 'Bags', price: 38.0, rating: 4.3, reviews: 77, emoji: '👜' },
    { id: 'p10', name: 'Strider Running Shoes', category: 'Footwear', price: 94.99, rating: 4.5, reviews: 256, emoji: '👟' },
    { id: 'p11', name: 'Cove Canvas Sneakers', category: 'Footwear', price: 52.0, rating: 4.2, reviews: 143, emoji: '👟' },
    { id: 'p12', name: 'Lumen Desk Lamp', category: 'Home', price: 29.99, rating: 4.4, reviews: 109, emoji: '💡' },
    { id: 'p13', name: 'Haven Throw Blanket', category: 'Home', price: 33.0, rating: 4.6, reviews: 187, emoji: '🧺' },
    { id: 'p14', name: 'Brew Pour-Over Kettle', category: 'Home', price: 42.5, rating: 4.5, reviews: 93, emoji: '🫖' },
    { id: 'p15', name: 'Keystone Mechanical Keyboard', category: 'Tech', price: 68.0, rating: 4.7, reviews: 198, emoji: '⌨️' },
    { id: 'p16', name: 'Glide Wireless Mouse', category: 'Tech', price: 22.0, rating: 4.3, reviews: 121, emoji: '🖱️' }
  ];

  const CATEGORIES = ['All', ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

  /* ------------------------------------------------------------
     Elements
     ------------------------------------------------------------ */
  const grid = document.getElementById('product-grid');
  const productTemplate = document.getElementById('product-card-template');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const filterRow = document.getElementById('category-filters');
  const resultCount = document.getElementById('result-count');
  const noResults = document.getElementById('no-results');

  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = document.getElementById('cart-close');
  const cartDrawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('overlay');
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartTemplate = document.getElementById('cart-item-template');
  const cartCountEl = document.getElementById('cart-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutNote = document.getElementById('checkout-note');

  let activeCategory = 'All';
  let searchTerm = '';
  let sortBy = 'featured';
  let cart = {}; // { productId: quantity }

  /* ------------------------------------------------------------
     Cart persistence
     ------------------------------------------------------------ */
  const loadCart = () => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
  };
  const saveCart = () => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
  };

  /* ------------------------------------------------------------
     Filtering helpers
     ------------------------------------------------------------ */
  const getFilteredProducts = () => {
    let list = PRODUCTS.filter((p) => activeCategory === 'All' || p.category === activeCategory);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
    }
    switch (sortBy) {
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'name-asc': list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating-desc': list = [...list].sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return list;
  };

  const starString = (rating) => {
    const full = Math.round(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  };

  const formatPrice = (value) => '$' + value.toFixed(2);

  /* ------------------------------------------------------------
     Render: product grid
     ------------------------------------------------------------ */
  const renderCategoryFilters = () => {
    filterRow.innerHTML = '';
    CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-chip' + (cat === activeCategory ? ' active' : '');
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.setAttribute('aria-pressed', String(cat === activeCategory));
      filterRow.appendChild(btn);
    });
  };

  const renderProducts = () => {
    const list = getFilteredProducts();
    grid.innerHTML = '';

    resultCount.textContent = list.length === PRODUCTS.length
      ? PRODUCTS.length + ' products'
      : list.length + (list.length === 1 ? ' result' : ' results');
    noResults.hidden = list.length > 0;

    list.forEach((product) => {
      const node = productTemplate.content.firstElementChild.cloneNode(true);
      node.dataset.id = product.id;
      node.querySelector('.thumb-emoji').textContent = product.emoji;
      node.querySelector('.product-category').textContent = product.category;
      node.querySelector('.product-name').textContent = product.name;
      node.querySelector('.stars').textContent = starString(product.rating);
      node.querySelector('.rating-count').textContent = '(' + product.reviews + ')';
      node.querySelector('.price').textContent = formatPrice(product.price);

      const addBtn = node.querySelector('.add-btn');
      const stepper = node.querySelector('.qty-stepper');
      const qtyValue = node.querySelector('.qty-value');
      const inCart = cart[product.id] || 0;
      if (inCart > 0) {
        addBtn.hidden = true;
        stepper.hidden = false;
        qtyValue.textContent = inCart;
      }

      grid.appendChild(node);
    });
  };

  /* ------------------------------------------------------------
     Render: cart drawer
     ------------------------------------------------------------ */
  const cartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      return product ? sum + product.price * qty : sum;
    }, 0);
  };

  const cartItemCount = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const renderCart = () => {
    const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
    cartItemsEl.innerHTML = '';
    cartEmptyEl.hidden = entries.length > 0;

    entries.forEach(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      const node = cartTemplate.content.firstElementChild.cloneNode(true);
      node.dataset.id = id;
      node.querySelector('.thumb-emoji').textContent = product.emoji;
      node.querySelector('.cart-item-name').textContent = product.name;
      node.querySelector('.cart-item-price').textContent = formatPrice(product.price) + ' each';
      node.querySelector('.qty-value').textContent = qty;
      cartItemsEl.appendChild(node);
    });

    const count = cartItemCount();
    cartCountEl.hidden = count === 0;
    cartCountEl.textContent = count;
    cartSubtotalEl.textContent = formatPrice(cartTotal());
  };

  const renderAll = () => { renderProducts(); renderCart(); };

  /* ------------------------------------------------------------
     Cart mutations
     ------------------------------------------------------------ */
  const setQty = (id, qty) => {
    if (qty <= 0) delete cart[id];
    else cart[id] = qty;
    saveCart();
    renderAll();
  };
  const addToCart = (id) => setQty(id, (cart[id] || 0) + 1);
  const increment = (id) => setQty(id, (cart[id] || 0) + 1);
  const decrement = (id) => setQty(id, (cart[id] || 0) - 1);
  const removeFromCart = (id) => setQty(id, 0);

  /* ------------------------------------------------------------
     Events: search, sort, filters
     ------------------------------------------------------------ */
  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value.trim();
    renderProducts();
  });

  sortSelect.addEventListener('change', () => {
    sortBy = sortSelect.value;
    renderProducts();
  });

  filterRow.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-chip');
    if (!btn) return;
    activeCategory = btn.dataset.category;
    renderCategoryFilters();
    renderProducts();
  });

  /* ------------------------------------------------------------
     Events: product grid (add / qty)
     ------------------------------------------------------------ */
  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.product');
    if (!card) return;
    const id = card.dataset.id;

    if (event.target.closest('.add-btn')) { addToCart(id); return; }
    if (event.target.closest('.qty-plus')) { increment(id); return; }
    if (event.target.closest('.qty-minus')) { decrement(id); return; }
  });

  /* ------------------------------------------------------------
     Events: cart drawer item controls
     ------------------------------------------------------------ */
  cartItemsEl.addEventListener('click', (event) => {
    const item = event.target.closest('.cart-item');
    if (!item) return;
    const id = item.dataset.id;

    if (event.target.closest('.qty-plus')) { increment(id); return; }
    if (event.target.closest('.qty-minus')) { decrement(id); return; }
    if (event.target.closest('.remove-btn')) { removeFromCart(id); return; }
  });

  /* ------------------------------------------------------------
     Events: open / close drawer
     ------------------------------------------------------------ */
  const openCart = () => {
    cartDrawer.hidden = false;
    overlay.hidden = false;
    cartToggle.setAttribute('aria-expanded', 'true');
    checkoutNote.textContent = '';
  };
  const closeCart = () => {
    cartDrawer.hidden = true;
    overlay.hidden = true;
    cartToggle.setAttribute('aria-expanded', 'false');
  };

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cartDrawer.hidden) closeCart(); });

  checkoutBtn.addEventListener('click', () => {
    if (cartItemCount() === 0) {
      checkoutNote.textContent = 'Your cart is empty.';
      return;
    }
    checkoutNote.textContent = 'This is a demo store, so no real order was placed. Thanks for trying it out!';
    cart = {};
    saveCart();
    renderAll();
  });

  /* ------------------------------------------------------------
     Init
     ------------------------------------------------------------ */
  cart = loadCart();
  renderCategoryFilters();
  renderAll();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
