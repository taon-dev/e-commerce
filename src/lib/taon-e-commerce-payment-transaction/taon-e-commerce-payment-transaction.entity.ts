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

@Index(['provider', 'providerTransactionId'], { unique: true })
@TaonEntity<TaonECommercePaymentTransactionEntity>({
  className: 'TaonECommercePaymentTransactionEntity',
  createTable: true,
})
export class TaonECommercePaymentTransactionEntity extends TaonBaseAbstractEntity<TaonECommercePaymentTransactionEntity> {
  @Column({ type: 'int' })
  orderId!: number;

  @Column({ type: 'varchar' })
  provider!: string;

  @Column({ type: 'varchar' })
  providerTransactionId!: string;

  @Column({ type: 'varchar' })
  status!: 'pending' | 'succeeded' | 'failed' | 'cancelled';

  @Column({ type: 'float' })
  amount!: number;

  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @ManyToOne(() => TaonECommerceOrderEntity, order => order.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: TaonECommerceOrderEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
