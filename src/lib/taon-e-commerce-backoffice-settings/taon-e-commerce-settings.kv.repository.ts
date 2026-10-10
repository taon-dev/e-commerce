import { TaonBaseKvRepository, TaonRepository } from 'taon/src';

@TaonRepository({
  className: 'TaonECommerceSettingsKvRepository',
})
export class TaonECommerceSettingsKvRepository extends TaonBaseKvRepository<
  Record<string, boolean>
> {}
