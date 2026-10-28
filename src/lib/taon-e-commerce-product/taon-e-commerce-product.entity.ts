import { TaonCmsContentEntity } from '@taon-dev/cms/src';
import { TaonGroupEntity } from '@taon-dev/session/src';
import {
  BooleanColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  String500Column,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';

import { TaonECommerceCartItemEntity } from '../taon-e-commerce-cart-item/taon-e-commerce-cart-item.entity';
import { TaonECommerceOrderItemEntity } from '../taon-e-commerce-order-item/taon-e-commerce-order-item.entity';
import { TaonECommerceProductPermissionEntity } from '../taon-e-commerce-product-permission/taon-e-commerce-product-permission.entity';
import type { TaonProductEligibility } from './taon-e-commerce-product-eligibility';

@TaonEntity<TaonECommerceProductEntity>({
  className: 'TaonECommerceProductEntity',
  createTable: true,
})
export class TaonECommerceProductEntity extends TaonBaseAbstractEntity<TaonECommerceProductEntity> {
  purchaseEligibility?: TaonProductEligibility;

  @String500Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @BooleanColumn(true)
  active!: boolean;

  @Column({ type: 'varchar' })
  type!: 'lifetime' | 'item' | 'subscription' | 'digital' | 'physical' | 'service';

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

  @Column({ type: 'float', nullable: true })
  stripeSyncedPrice!: number | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  stripeSyncedCurrency!: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeSyncedType!: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeSyncedName!: string | null;

  @Column({ type: 'text', nullable: true })
  stripeSyncedDescription!: string | null;

  @Column({ type: 'boolean', nullable: true })
  stripeSyncedActive!: boolean | null;

  @Column({ type: 'int', nullable: true })
  stripeSyncedIntervalValue!: number | null;

  @Column({ type: 'varchar', nullable: true })
  stripeSyncedIntervalUnit!: string | null;

  @Column({ type: 'int', nullable: true })
  maxQuantityPerUser!: number | null;

  @Column({ type: 'int', nullable: true })
  stockLimit!: number | null;

  @Column({ type: 'int', nullable: true })
  subscriptionIntervalValue!: number | null;

  @Column({ type: 'varchar', nullable: true })
  subscriptionIntervalUnit!: 'seconds' | 'minutes' | 'hours' | 'days' | null;

  @Column({ type: 'int', nullable: true })
  cmsContentId!: number | null;

  @BooleanColumn(false)
  inheritPermissionsFromPost!: boolean;

  @ManyToOne(() => TaonCmsContentEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cmsContentId' })
  cmsContent!: TaonCmsContentEntity | null;

  @ManyToMany(() => TaonGroupEntity)
  @JoinTable({
    name: 'taon_ecommerce_product_suggested_groups',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'groupId', referencedColumnName: 'id' },
  })
  suggestedGroups!: TaonGroupEntity[];

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
