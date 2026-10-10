import { TaonSessionUserEntity } from '@taon-dev/session/src';
import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';

@TaonEntity<TaonECommerceCustomerAddressEntity>({
  className: 'TaonECommerceCustomerAddressEntity',
  createTable: true,
})
export class TaonECommerceCustomerAddressEntity extends TaonBaseAbstractEntity<TaonECommerceCustomerAddressEntity> {
  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar' })
  type!: 'billing' | 'shipping';

  @Column({ type: 'varchar' })
  firstName!: string;

  @Column({ type: 'varchar' })
  lastName!: string;

  @Column({ type: 'varchar', nullable: true })
  company!: string | null;

  @Column({ type: 'varchar' })
  addressLine1!: string;

  @Column({ type: 'varchar', nullable: true })
  addressLine2!: string | null;

  @Column({ type: 'varchar' })
  city!: string;

  @Column({ type: 'varchar' })
  postalCode!: string;

  @Column({ type: 'varchar' })
  country!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @ManyToOne(() => TaonSessionUserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: TaonSessionUserEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
