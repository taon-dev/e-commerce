import type { TaonPermissionEntity } from '@taon-dev/session/src';

import type { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';

export function getTaonECommerceProductEffectivePermissions(
  product: TaonECommerceProductEntity,
): TaonPermissionEntity[] {
  if (product.inheritPermissionsFromPost) {
    return product.cmsContent?.permissions ?? [];
  }
  return product.permissions.map(link => link.permission);
}
