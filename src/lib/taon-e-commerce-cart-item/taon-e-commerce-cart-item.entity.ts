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

import { TaonECommerceCartEntity } from '../taon-e-commerce-cart/taon-e-commerce-cart.entity';
import { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

@Index(['cartId', 'productId'], { unique: true })
@TaonEntity({
  className: 'TaonECommerceCartItemEntity',
  createTable: true,
})
export class TaonECommerceCartItemEntity extends TaonBaseAbstractEntity<TaonECommerceCartItemEntity> {
  @Column({ type: 'int' })
  cartId!: number;

  @Column({ type: 'int' })
  productId!: number;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @ManyToOne(() => TaonECommerceCartEntity, cart => cart.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cartId' })
  cart!: TaonECommerceCartEntity;

  @ManyToOne(() => TaonECommerceProductEntity, product => product.cartItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: TaonECommerceProductEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
