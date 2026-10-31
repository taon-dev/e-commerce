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

## Checkout and Stripe lifecycle

Register these events on the **same** webhook endpoint:

- `checkout.session.completed`, `checkout.session.expired`
- `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed` (for delayed payment methods)
- `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`
- `invoice.paid`, `invoice.payment_failed`
- `charge.refunded`, `charge.dispute.closed`

`invoice.payment_succeeded` is also accepted for existing Stripe configurations.
Handlers retrieve current Stripe resources rather than trusting an older event's
snapshot. Local webhook writes use serializable transactions, so failed processing
rolls back and Stripe can retry. Checkout, subscription and invoice IDs identify
existing records; replaying a checkout neither consumes a new cart nor extends a
fixed-duration entitlement.

Expired checkouts cancel pending orders and release stock/purchase reservations.
Cart items remain available for another checkout. Leaving Stripe through
`cancel_url` only displays a message; it does not cancel the order.

Canceling subscription renewal retains access through the paid period end;
that deadline is enforced even if the final cancellation webhook is delayed.
Actual cancellation, unpaid, paused and expired states
remove access. `past_due` retains access during Stripe's retry/dunning window;
configure Stripe's final failed-payment action to cancel or mark the subscription
unpaid when that window ends. Invoices update payment history and reconcile the
current subscription period and status, including when delivered before checkout
completion.

Full refunds and full-amount lost disputes for normal/lifetime Checkout payments mark the
order/payment refunded and revoke that order's entitlements. Partial refunds
and partial lost disputes leave access intact. Other purchases and directly assigned permissions are not
revoked. A refunded lifetime purchase can be purchased again.

## Product presentation and eligibility

Use the product editor's **Link to post** field to associate a CMS post. Published
post titles, excerpts, public content and thumbnails enrich the product details
dialog. Protected post bodies and video/audio/file attachments are not exposed
by the sales preview. Product thumbnails reuse CMS storage/download tokens,
including for posts whose full content requires purchase.

Product information opens a normal details dialog from Buy, Cart and Checkout;
purchase, quantity and remove controls are separate. List thumbnails are bounded
to 100px height, checkout thumbnails to 50px, preserving aspect ratio. Neither
list downloads full post media attachments.

The backend exposes `purchaseEligibility: { canAdd, reason }` on suggested
products. Its shared eligibility check is also used by cart mutations and
checkout, enforcing singleton lifetime/subscription purchases, ownership/current
subscriptions, pending reservations, stock, per-user limits, currency and
recurring-checkout compatibility. Unavailable suggestions remain visible with a
reason; cart changes refresh their eligibility. Lifetime and subscription cart
quantities are always one.

## Regression tests

With the project's existing TypeScript dependency available:

```sh
node --test src/tests/e-commerce-lifecycle.test.cjs
```

These tests load the actual isomorphic business methods with in-memory
repositories and Stripe API doubles. They cover eligibility, webhook replays,
out-of-order invoices/refunds, cancellation timing, retrying payments, refund
access revocation and transactional rollback. They do not replace live Stripe or
database integration testing.

## Courses from CMS posts

Import `TaonCourseComponent` and `TaonCourseTabsComponent` into the consuming
Angular component. Both are standalone components exported by this package:

```html
<taon-course-tabs>
  <taon-course
    publicCoursePostSlug="bachatap1public"
    privateCoursePostSlug="bachatap1private"
    [context]="context" />
  <taon-course
    publicCoursePostSlug="bachatap2public"
    privateCoursePostSlug="bachatap2private"
    [context]="context" />
</taon-course-tabs>
```

Use the same `taon-course` without the tabs wrapper for a large parent hero.
Inside tabs the parent is the first clickable row. Tab labels follow the
authorized parent, using its thumbnail when present and title otherwise.
Material handles tab-header pagination on narrow screens.

Each root is an ordinary CMS post. Add lessons through its existing related-post
editor; the components keep the order returned by CMS. Enable **Apply permissions
to related posts** on the protected root so lessons inherit its permissions.
Link the existing product to the protected root and configure its effective
permissions as usual. No course table, special content types, or additional
purchase rules are involved. A private slug is optional.

Bind `context` to the latest authorization context emitted by the session button
or session state service. Every replacement reloads access from the server,
including login, logout and `refreshContext()` after authorization changes.
The browser context is a refresh trigger, never an authorization credential.
The server uses the session and entitlement-aware auth repository; it never
trusts permissions supplied by a caller. Applications must use this package's
`TaonAuthContextRepository` override in their concrete Taon context, as for
protected purchased CMS media. After a purchase is finalized, refresh the
session context through the existing session API/state flow.

`TaonCourseController` is registered by `TaonECommerceAbstractContext`. It bridges
the CMS's manager-only post/related-post endpoints to read-only course
presentation using CMS effective permission inheritance and the CMS media read
policy (published and unprotected, superuser, or a matching permission). Each
lesson is checked separately, and unchecked nested relations are not returned.
Missing/inaccessible previews produce a retryable error; a missing private root
falls back to the preview with a notice. Inaccessible lessons are omitted with
a notice.

Rows fetch only thumbnails initially. Video/audio rows instantiate the existing
clean CMS renderer on demand (`preload="none"`); attachments use CMS download
links; text posts open the clean CMS renderer in a Material dialog. Context
changes discard stale loads, close course dialogs, and remove old players.
