import { TaonCmsContentEntity } from '@taon-dev/cms/src';
import { ClassHelpers, TaonBaseMigration, TaonMigration } from 'taon/src';
import { QueryRunner, TableColumn } from 'taon-typeorm/src';



@TaonMigration({
  className: 'ECommerce_1792579000000_postPermissionInheritance',
})
export class ECommerce_1792579000000_postPermissionInheritance extends TaonBaseMigration {
  async up(queryRunner: QueryRunner): Promise<void> {
    const table = ClassHelpers.getName(TaonCmsContentEntity);
    if (
      !(await queryRunner.hasColumn(table, 'applyPermissionsToRelatedPosts'))
    ) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: 'applyPermissionsToRelatedPosts',
          type: 'boolean',
          default: false,
        }),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = ClassHelpers.getName(TaonCmsContentEntity);
    if (await queryRunner.hasColumn(table, 'applyPermissionsToRelatedPosts')) {
      await queryRunner.dropColumn(table, 'applyPermissionsToRelatedPosts');
    }
  }
}
