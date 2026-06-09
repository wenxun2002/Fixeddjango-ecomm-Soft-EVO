# Fixed Bug Reference

Quick index of every bug fix and the files touched. Pair with the **Bug Fixes & Improvements** section in [`README.md`](README.md) for problem / change / effect details.

---

## 1. Real-time cart total on quantity change

| File | What changed |
|------|--------------|
| `static/assets/js/function.js` | `updateCartTotalsAndBackend()` — local line + cart total recalc; 500 ms debounced AJAX to `/update-cart`; qtybtn / manual input handlers |

---

## 2. Stock quantity limit (product detail + cart)

### Product detail page

| File | What changed |
|------|--------------|
| `templates/core/product-detail.html` | `data-max="{{ product.stock_count }}"` on quantity input |
| `static/assets/js/function.js` | Input sanitization + max-stock check (shared handler) |
| `static/assets/js/main.js` | +/- button stock cap on product detail |

### Cart page

| File | What changed |
|------|--------------|
| `templates/core/async/cart-list.html` | `data-max` on qty input; inline pro-qty script (stock cap, trash icon at qty 1) |
| `templates/core/cart.html` | Same clickable title + qty structure as async partial |
| `static/assets/js/function.js` | Cart qty validation + debounced update (see §1) |
| `core/views.py` | `add_to_cart` — server-side cap vs `stock_count`; `cart_view` / `delete_from_cart` / `update_cart` pass `stock_count` to template |

---

## 3. Add to cart & wishlist toggle

| File | What changed |
|------|--------------|
| `static/assets/js/function.js` | Add-to-cart disable + 2 s cooldown; wishlist icon toggle on `response.bool` |
| `core/views.py` | `add_to_wishlist` — create/delete toggle; returns `bool` + `wishlist_count` |

---

## 4. Sign in / Sign out labels & language dropdown

| File | What changed |
|------|--------------|
| `templates/partials/base.html` | "Sign in" / "Sign out"; Spanish + English language options (desktop + mobile) |
| `templates/userauths/sing-in.html` | Page title, header, button, link text → "Sign in" |
| `templates/userauths/sing-up.html` | Page title, header, button, link text → "Sign up" / "Sign in" |
| `templates/userauths/account.html` | Sign Out tab label |

> URL names (`sing-in`, `sing-out`) are unchanged — only user-visible text was corrected.

---

## 5. Clickable product titles (cart & wishlist)

| File | What changed |
|------|--------------|
| `templates/core/cart.html` | Product title → link to `products-detail` via `item.pid` |
| `templates/core/async/cart-list.html` | Same link in AJAX-refreshed cart partial |
| `templates/core/wishlist.html` | Product title → link via `w.product.pid` |
| `templates/core/async/wishlist-list.html` | Same link in AJAX-refreshed wishlist partial |

---

## 6. Admin — password & read-only fields

### Password (plain hash no longer editable)

| File | What changed |
|------|--------------|
| `userauths/admin.py` | `UserAdmin(BaseUserAdmin)` — standard password change widget |

### Read-only IDs & user-generated content

| File | What changed |
|------|--------------|
| `core/admin.py` | `readonly_fields`: `pid`, `cid`, `vid`; review + wishlist user/product fields |
| `blog/admin.py` | `readonly_fields`: post `pid`, category `cid` |

---

## File summary (all touched paths)

```
static/assets/js/function.js          
static/assets/js/main.js              
core/views.py                         
templates/core/product-detail.html    
templates/core/cart.html              
templates/core/async/cart-list.html   
templates/core/wishlist.html          
templates/core/async/wishlist-list.html 
templates/partials/base.html          
templates/userauths/sing-in.html      
templates/userauths/sing-up.html      
templates/userauths/account.html      
userauths/admin.py                    
core/admin.py                         
blog/admin.py                         
```
