import { BlockCollector } from './block-collector';
import { EditorialContext } from './schemas/site-page';

export type GetSlots = (ctx: EditorialContext, options?: GetSlotsOptions) => Promise<any> | any;

export type GetSlotsOptions = { slotIds?: string[]; collector?: BlockCollector };
