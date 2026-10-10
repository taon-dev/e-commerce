import { TaonBaseRepository, TaonRepository } from 'taon/src';

import { TaonECommerceCartEntity } from '../taon-e-commerce-cart/taon-e-commerce-cart.entity';
import { TaonECommerceCartItemEntity } from '../taon-e-commerce-cart-item/taon-e-commerce-cart-item.entity';
import { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.entity';
import { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

@TaonRepository({
  className: 'TaonECommerceCustomerRepository',
})
export class TaonECommerceCustomerRepository extends TaonBaseRepository<TaonECommerceCartEntity> {
  entityClassResolveFn: () => typeof TaonECommerceCartEntity = () =>
    TaonECommerceCartEntity;

  async getCart(userId: number): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    let cart = await this.repo.findOne({
      where: { userId },
      relations: { items: { product: true } },
    });
    if (!cart) {
      cart = await this.repo.save(this.repo.create({ userId }));
      cart = await this.repo.findOne({
        where: { id: cart.id },
        relations: { items: { product: true } },
      });
    }
    if (!cart) {
      throw new Error('Unable to load the current user cart.');
    }
    return cart;
    //#endregion
  }

  async addProduct(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error('Product and quantity must be positive whole numbers.');
    }

    const product = await this.connection
      .getRepository(TaonECommerceProductEntity)
      .findOne({ where: { id: productId, active: true } });
    if (!product) {
      throw new Error('The selected product is not available.');
    }

    const cart = await this.getCart(userId);
    const items = this.connection.getRepository(TaonECommerceCartItemEntity);
    const existing = await items.findOne({
      where: { cartId: cart.id, productId },
    });
    if (existing) {
      existing.quantity += quantity;
      await items.save(existing);
    } else {
      await items.save(items.create({ cartId: cart.id, productId, quantity }));
    }
    return this.getCart(userId);
    //#endregion
  }

  async setItemQuantity(
    userId: number,
    itemId: number,
    quantity: number,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (
      !Number.isSafeInteger(itemId) ||
      itemId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error('Item and quantity must be positive whole numbers.');
    }
    const cart = await this.getCart(userId);
    const items = this.connection.getRepository(TaonECommerceCartItemEntity);
    const item = await items.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) {
      throw new Error('The cart item was not found.');
    }
    item.quantity = quantity;
    await items.save(item);
    return this.getCart(userId);
    //#endregion
  }

  async removeItem(
    userId: number,
    itemId: number,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (!Number.isSafeInteger(itemId) || itemId <= 0) {
      throw new Error('The cart item ID is invalid.');
    }
    const cart = await this.getCart(userId);
    const items = this.connection.getRepository(TaonECommerceCartItemEntity);
    const item = await items.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) {
      throw new Error('The cart item was not found.');
    }
    await items.remove(item);
    return this.getCart(userId);
    //#endregion
  }

  async getOrders(userId: number): Promise<TaonECommerceOrderEntity[]> {
    //#region @websqlFunc
    return this.connection.getRepository(TaonECommerceOrderEntity).find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    //#endregion
  }

  async getTransactions(
    userId: number,
  ): Promise<TaonECommercePaymentTransactionEntity[]> {
    //#region @websqlFunc
    return this.connection
      .getRepository(TaonECommercePaymentTransactionEntity)
      .find({
        where: { order: { userId } },
        relations: { order: true },
        order: { createdAt: 'DESC' },
      });
    //#endregion
  }
}
