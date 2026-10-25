import { TaonSessionUserEntity } from '@taon-dev/session/src';
import {
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';

import { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

@Index(['userId', 'productId'])
@Index(['orderId', 'productId'], { unique: true })
@Index(['stripeSubscriptionId'], { unique: true })
@TaonEntity<TaonECommerceEntitlementEntity>({
  className: 'TaonECommerceEntitlementEntity',
  createTable: true,
})
export class TaonECommerceEntitlementEntity extends TaonBaseAbstractEntity<TaonECommerceEntitlementEntity> {
  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'int' })
  productId!: number;

  @Column({ type: 'int' })
  orderId!: number;

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeSubscriptionId!: string | null;

  @Column({ type: 'varchar' })
  status!: 'active' | 'canceled' | 'past_due' | 'expired';

  @Column({ type: 'datetime' })
  startedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  currentPeriodStart!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  currentPeriodEnd!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  canceledAt!: Date | null;

  @ManyToOne(() => TaonSessionUserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: TaonSessionUserEntity;

  @ManyToOne(() => TaonECommerceProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product!: TaonECommerceProductEntity;

  @ManyToOne(() => TaonECommerceOrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: TaonECommerceOrderEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
