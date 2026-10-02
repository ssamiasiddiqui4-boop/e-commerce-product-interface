# Luxe Market — E-Commerce Product Interface

Auspify Technologies Frontend Developer Internship, Task 5.

A demo storefront built with plain HTML5, CSS3 and JavaScript (no frameworks, no backend). Product data lives in `js/script.js`; the cart is saved in the browser with Local Storage.

## Features

- Product catalog of 16 demo products across 6 categories
- Live search by product name or category
- Category filter chips
- Sort by price, name or rating
- Shopping cart drawer with quantity steppers, item removal and a running subtotal
- Cart badge in the header showing the number of items
- Cart persists across page reloads (Local Storage)
- Demo checkout (clears the cart and shows a confirmation message — no real payment or backend)
- Same premium dark glass theme as the rest of the portfolio
- Fully responsive grid and cart drawer

## Project structure

```
Task5_Ecommerce_Product_Interface/
├── index.html
├── css/style.css
├── js/script.js
└── README.md
```

## How it works

- **Component-based cards:** a `<template>` defines one product card and one cart line item; JavaScript clones and fills them, instead of writing HTML strings.
- **State:** `activeCategory`, `searchTerm` and `sortBy` drive `getFilteredProducts()`, which the grid re-renders from on every change. The `cart` object (`{ productId: quantity }`) drives the cart drawer and badge the same way.
- **Event delegation:** one click listener on the grid and one on the cart list handle every card's "Add to cart" and quantity buttons, instead of a listener per card.

## Customise

- Edit the `PRODUCTS` array in `js/script.js` to add, remove or change products (name, category, price, rating, reviews, emoji icon).
- Product thumbnails are drawn with CSS and an emoji rather than photos, so there's nothing to replace if you add more products — just pick an emoji that fits.

## Run locally

Open `index.html` in a browser, or use the Live Server extension in VS Code.

## Deploy

Push the folder to GitHub, then enable GitHub Pages (Settings, Pages, branch `main`, folder `/root`).
