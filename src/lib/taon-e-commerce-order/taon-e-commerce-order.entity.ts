import { TaonSessionUserEntity } from '@taon-dev/session/src';
import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';

import { TaonECommerceOrderItemEntity } from '../taon-e-commerce-order-item/taon-e-commerce-order-item.entity';
import { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.entity';

@TaonEntity<TaonECommerceOrderEntity>({
  className: 'TaonECommerceOrderEntity',
  createTable: true,
})
export class TaonECommerceOrderEntity extends TaonBaseAbstractEntity<TaonECommerceOrderEntity> {
  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar' })
  status!: 'pending' | 'paid' | 'cancelled' | 'failed';

  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @Column({ type: 'float' })
  subtotal!: number;

  @Column({ type: 'float' })
  total!: number;

  @ManyToOne(() => TaonSessionUserEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'userId' })
  user!: TaonSessionUserEntity;

  @OneToMany(() => TaonECommerceOrderItemEntity, item => item.order)
  items!: TaonECommerceOrderItemEntity[];

  @OneToMany(
    () => TaonECommercePaymentTransactionEntity,
    transaction => transaction.order,
  )
  transactions!: TaonECommercePaymentTransactionEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
