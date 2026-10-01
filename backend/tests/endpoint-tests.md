# Planned endpoint smoke tests

These checks should be run once MongoDB and the Dev 1 auth flow are merged. They are intentionally focused on the public shop/product flow and the customer review gate.

## 1) Public vendor shop lookup

```bash
curl -s http://localhost:5000/api/v1/shops/vendor/<vendorId>
```

Expected result:
- HTTP 200
- Returns the vendor’s shop profile, including `id`, `name`, `ownerId`, and `productCount`
- No authentication required

## 2) Vendor product list

```bash
curl -s "http://localhost:5000/api/v1/products?vendor=<vendorId>&page=1&limit=12"
```

Expected result:
- HTTP 200
- Returns products for the selected vendor only
- Includes pagination metadata

## 3) Filtered product queries

```bash
curl -s "http://localhost:5000/api/v1/products?category=<categoryId>&vendor=<vendorId>&minPrice=100&maxPrice=500&minRating=4&page=1&limit=10"
```

Expected result:
- HTTP 200
- Filters are applied and validation passes for category, vendor, price, rating, page, and limit

## 4) Review creation as a customer

```bash
curl -s -X POST http://localhost:5000/api/v1/reviews \
  -H "Authorization: Bearer <customer-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "<productId>",
    "rating": 5,
    "comment": "Excellent product."
  }'
```

Expected result:
- HTTP 201 for a customer account
- A review is created and product rating aggregates update

## 5) Review creation denied for non-customers

```bash
curl -s -X POST http://localhost:5000/api/v1/reviews \
  -H "Authorization: Bearer <vendor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "<productId>",
    "rating": 4,
    "comment": "Test"
  }'
```

Expected result:
- HTTP 403
- Response: "Only customers can submit product reviews"

## 6) Verified purchase check (deferred)

Once the orders domain is ready, add a check that the acting customer has a verified purchase for the product before creating a review. Keep the current guard as the first pass until that order data is merged.
