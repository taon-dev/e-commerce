import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';

import { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

@TaonEntity<TaonECommerceOrderItemEntity>({
  className: 'TaonECommerceOrderItemEntity',
  createTable: true,
})
export class TaonECommerceOrderItemEntity extends TaonBaseAbstractEntity<TaonECommerceOrderItemEntity> {
  @Column({ type: 'int' })
  orderId!: number;

  @Column({ type: 'int' })
  productId!: number;

  @Column({ type: 'varchar' })
  productName!: string;

  @Column({ type: 'float' })
  unitPrice!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'float' })
  totalPrice!: number;

  @ManyToOne(() => TaonECommerceOrderEntity, order => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: TaonECommerceOrderEntity;

  @ManyToOne(() => TaonECommerceProductEntity, product => product.orderItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: TaonECommerceProductEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
