import { TaonCmsContentEntity } from '@taon-dev/cms/src';
import { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import { ClassHelpers, TaonBaseMigration, TaonMigration } from 'taon/src';
import { QueryRunner, TableColumn } from 'taon-typeorm/src';

@TaonMigration({
  className: 'ECommerce_1793664000000_checkoutExpiryAndPostVersions',
})
export class ECommerce_1793664000000_checkoutExpiryAndPostVersions extends TaonBaseMigration {
  async up(queryRunner: QueryRunner): Promise<void> {
    const contentTable = ClassHelpers.getName(TaonCmsContentEntity);
    for (const name of ['publicVersionPostId', 'privateVersionPostId']) {
      if (!(await queryRunner.hasColumn(contentTable, name))) {
        await queryRunner.addColumn(
          contentTable,
          new TableColumn({
            name,
            type: 'integer',
            isNullable: true,
          }),
        );
      }
    }

    const orderTable = ClassHelpers.getName(TaonECommerceOrderEntity);
    if (!(await queryRunner.hasColumn(orderTable, 'stripeCheckoutSessionExpiresAt'))) {
      await queryRunner.addColumn(
        orderTable,
        new TableColumn({
          name: 'stripeCheckoutSessionExpiresAt',
          type: 'datetime',
          isNullable: true,
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const orderTable = ClassHelpers.getName(TaonECommerceOrderEntity);
    if (await queryRunner.hasColumn(orderTable, 'stripeCheckoutSessionExpiresAt')) {
      await queryRunner.dropColumn(orderTable, 'stripeCheckoutSessionExpiresAt');
    }

    const contentTable = ClassHelpers.getName(TaonCmsContentEntity);
    for (const name of ['privateVersionPostId', 'publicVersionPostId']) {
      if (await queryRunner.hasColumn(contentTable, name)) {
        await queryRunner.dropColumn(contentTable, name);
      }
    }
  }
}
