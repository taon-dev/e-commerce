# @taon-dev/e-commerce

Use `taon-cart-button` to expose the shared cart UI in an application. Both
cart components accept the same `TaonCartConfig`; Buy is shown only when
suggested products are provided.

```ts
import type { TaonCartConfig } from '@taon-dev/e-commerce/src';

const cartConfig: TaonCartConfig = {
  suggestedProducts: products,
  iconShortText: 'Shop',
};
```

```html
<taon-cart-button [config]="cartConfig" />
```

The cart's Orders and Transactions pages use authenticated backend endpoints
that derive the current user from the session. Subscription statuses are
example data and are not a complete subscription implementation.

       