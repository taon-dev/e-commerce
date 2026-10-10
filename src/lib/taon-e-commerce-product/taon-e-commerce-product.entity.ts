import {
  BooleanColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  String500Column,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';

import { TaonECommerceCartItemEntity } from '../taon-e-commerce-cart-item/taon-e-commerce-cart-item.entity';
import { TaonECommerceOrderItemEntity } from '../taon-e-commerce-order-item/taon-e-commerce-order-item.entity';
import { TaonECommerceProductPermissionEntity } from '../taon-e-commerce-product-permission/taon-e-commerce-product-permission.entity';

@TaonEntity<TaonECommerceProductEntity>({
  className: 'TaonECommerceProductEntity',
  createTable: true,
})
export class TaonECommerceProductEntity extends TaonBaseAbstractEntity<TaonECommerceProductEntity> {
  @String500Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @BooleanColumn(true)
  active!: boolean;

  @Column({ type: 'varchar' })
  type!: 'digital' | 'physical' | 'service';

  @Column({ type: 'float' })
  price!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'varchar', nullable: true })
  stripeProductId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripePriceId!: string | null;

  @Column({ type: 'datetime', nullable: true })
  stripeLastSyncedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => TaonECommerceProductPermissionEntity, link => link.product)
  permissions!: TaonECommerceProductPermissionEntity[];

  @OneToMany(() => TaonECommerceCartItemEntity, item => item.product)
  cartItems!: TaonECommerceCartItemEntity[];

  @OneToMany(() => TaonECommerceOrderItemEntity, item => item.product)
  orderItems!: TaonECommerceOrderItemEntity[];
}
