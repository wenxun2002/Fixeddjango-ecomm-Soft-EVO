# Django Full Stack E-Commerce Application for Evolution
CSE6364 SOFTWARE EVOLUTION & MAINTENANCE
GitHub Repository: https://github.com/wenxun2002/Fixeddjango-ecomm-Soft-EVO


This project is a comprehensive solution for building and managing a robust e-commerce platform using Python, Django, JavaScript, jQuery, and SQLite.
Just for learning Software evolution course.

## Demo💫

🌐👉https://valleys.pythonanywhere.com

**Homepage**
![изображение](https://github.com/kolosochok/django-ecommerce/assets/148413963/a090bc2a-eaa8-47ca-97be-5560d857df6e)

**Admin Panel**
![изображение](https://github.com/kolosochok/django-ecommerce/assets/148413963/505d1126-a2ed-4dec-b6b0-eb68be823a3d)

## Overview⚡️

This project aims to provide a solid foundation to create a feature-rich and scalable e-commerce website. Leveraging the power of Django, a high-level web framework written in Python, and integrating dynamic front-end interactions with JavaScript and jQuery, our application delivers a seamless and responsive user experience.

## Tech Stack🚀

- Backend: Python, Django
- Frontend: JavaScript, jQuery
- Database: SQLite

## Features📚

- User Authentication
- User Profile
- Shopping Cart
- Wishlist
- Product Discount
- Products / Vendors Page
- Product detail / Vendor detail Page
- Tags for Product and Blog
- Category list Page
- Improved Admin Panel
- Product Reviews
- Blog post Comments
- Products Filter
- Search Functionality
- Related Products
- Related Blog posts

## Bug Fixes & Improvements (Software Evolution)🔧

This fork addresses several usability, data-integrity, and admin-panel issues found in the original project. See [`fixedbugline.md`](fixedbugline.md) for the exact files changed.

### 1. Real-time cart total on quantity change

**Problem:** Changing quantity on the cart page did not update the line total or cart subtotal until a full page refresh.

**Changes:** Added client-side total recalculation and a debounced (500 ms) AJAX sync to `/update-cart` in `static/assets/js/function.js`. The UI updates immediately; the backend is updated after the user stops clicking.

**Effect:** Item totals and the cart subtotal update instantly when using +/- buttons or manual input, without losing input focus or resetting the cart table.

---

### 2. Stock quantity enforcement

**Problem:** Users could add or set quantities above available stock on the product detail page and cart page.

**Changes:**
- **Frontend:** `data-max` attribute on quantity inputs; validation in `static/assets/js/function.js`, `static/assets/js/main.js`, and inline logic in `templates/core/async/cart-list.html` (blocks non-numeric input, caps at max stock, shows alert).
- **Backend:** `add_to_cart` in `core/views.py` caps quantity against `Product.stock_count` and returns a warning message when the limit is hit.
- **Templates:** `templates/core/product-detail.html` passes `data-max="{{ product.stock_count }}"`; cart views inject `stock_count` per item.

**Effect:** Quantity cannot exceed inventory on either page. Server-side validation prevents over-ordering when adding to cart; client-side validation gives immediate feedback while editing quantities.

---

### 3. Add to cart & wishlist toggle buttons

**Problem:** Add-to-cart could be double-submitted; wishlist heart icon did not toggle add/remove correctly.

**Changes:**
- **Add to cart:** Button is disabled during the AJAX request and for 2 seconds after success (with a checkmark feedback) in `static/assets/js/function.js`.
- **Wishlist:** `add_to_wishlist` in `core/views.py` toggles — creates if absent, deletes if present — and returns `bool` so the heart icon switches between filled (`icon_heart`) and outline (`icon_heart_alt`).

**Effect:** No duplicate cart entries from rapid clicks. Wishlist button works as a true toggle on product pages.

---

### 4. Sign in / Sign out label & localization typo fixes

**Problem:** UI showed "Sing in" / "Sing out" instead of "Sign in" / "Sign out". Language dropdown listed "Ukrainian" on mobile but "Spanish" on desktop.

**Changes:** Corrected labels in `templates/partials/base.html`, `templates/userauths/sing-in.html`, `templates/userauths/sing-up.html`, and `templates/userauths/account.html`. Unified language options to Spanish / English.

**Effect:** Consistent, correct auth labels across desktop and mobile; language selector matches on both layouts.

---

### 5. Clickable product titles in cart & wishlist

**Problem:** Product names in cart and wishlist were plain text with no link to the product detail page.

**Changes:** Wrapped titles in `<a href="{% url 'core:products-detail' ... %}">` in `templates/core/cart.html`, `templates/core/async/cart-list.html`, `templates/core/wishlist.html`, and `templates/core/async/wishlist-list.html`.

**Effect:** Users can click a product name in cart or wishlist to navigate directly to its detail page.

---

### 6. Admin panel — password & identifier protection

**Problem:** Admin exposed hashed passwords as editable plain text. Auto-generated IDs (`pid`, `cid`, `vid`) and user-generated review/wishlist data could be accidentally modified.

**Changes:**
- **`userauths/admin.py`:** Switched to `BaseUserAdmin` so passwords use Django’s built-in change form (hash on save, not displayed as raw hash).
- **`core/admin.py`:** `pid`, `cid`, `vid` set as `readonly_fields`; `ProductReview` and `Wishlist` user/product fields are read-only.
- **`blog/admin.py`:** Blog post `pid` and category `cid` set as read-only.

**Effect:** Admins change passwords through the standard secure flow. UUID-style identifiers and user-submitted review/wishlist records are protected from accidental edits.

---

## Installation Guide📚

1. Clone and change to the directory:

```
git clone https://github.com/wenxun2002/Fixeddjango-ecomm-Soft-EVO.git
cd django-ecommerce
```

2. Create and activate a virtual environment:

Unix based systems:
```
virtualenv env
source env/bin/activate
```

Windows:
```
python -m venv env
```

```
env/Scripts/activate
```

3. Install Python requirements:

```
pip install -r requirements.txt
```

4. Create a SECRET_KEY and copy:

```
python secret_key.py
```

5. Create a `.env` file and add a SECRET_KEY value to `.env`:

```
SECRET_KEY=generated-secret-key
```

6. Migrate DB:

```
python manage.py migrate
```

7. To create superuser:

```
python manage.py createsuperuser
```

8. Run application:

```
python manage.py runserver
```

*happy coding*
