# @taon-dev/e-commerce

`taon-cart-button` opens the authenticated cart and checkout flow. Available
products are loaded from the backend, which filters inactive products and
applies product-group suggestions for the current user.

Configure Stripe's secret key and webhook signing secret in the server-side
Taon environment (`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_KEY`). Never expose
these values to browser code. The Products page's **Sync with Stripe** dialog
checks the server connection, synchronizes local products, and displays the
dedicated webhook URL to register in Stripe.

Stripe webhooks are signature-verified against the raw request body. Orders
and product entitlements are finalized from verified Stripe events, not from
the browser success redirect. Day-based subscription intervals use Stripe
recurring prices; seconds, minutes, and hours are represented as Taon-side
entitlement expirations.
