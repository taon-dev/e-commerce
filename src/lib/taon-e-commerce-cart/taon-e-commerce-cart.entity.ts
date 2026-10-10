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

import { TaonECommerceCartItemEntity } from '../taon-e-commerce-cart-item/taon-e-commerce-cart-item.entity';

@TaonEntity({
  className: 'TaonECommerceCartEntity',
  createTable: true,
})
export class TaonECommerceCartEntity extends TaonBaseAbstractEntity<TaonECommerceCartEntity> {
  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => TaonSessionUserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: TaonSessionUserEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => TaonECommerceCartItemEntity, item => item.cart)
  items!: TaonECommerceCartItemEntity[];
}
