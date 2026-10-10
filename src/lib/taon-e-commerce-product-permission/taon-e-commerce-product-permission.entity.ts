import { TaonPermissionEntity } from '@taon-dev/session/src';
import {
  Column,
  Index,
  JoinColumn,
  ManyToOne,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';

import { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

@Index(['productId', 'permissionId'], { unique: true })
@TaonEntity<TaonECommerceProductPermissionEntity>({
  className: 'TaonECommerceProductPermissionEntity',
  createTable: true,
})
export class TaonECommerceProductPermissionEntity extends TaonBaseAbstractEntity<TaonECommerceProductPermissionEntity> {
  @Column({ type: 'int' })
  productId!: number;

  @Column({ type: 'int' })
  permissionId!: number;

  @ManyToOne(() => TaonECommerceProductEntity, product => product.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: TaonECommerceProductEntity;

  @ManyToOne(() => TaonPermissionEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permissionId' })
  permission!: TaonPermissionEntity;
}
