import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class Metadata {
  name: string;
  image?: string;
  external_url?: string;
  animation_url?: string;
  description?: string;
  attributes?: Object;
}

export type NFTDocument = NFT & Document;

@Schema()
export class NFT {
  @Prop({ required: true, immutable: true })
  item_id: string;

  @Prop({ required: true, immutable: true })
  tx_hash: string;

  @Prop({ required: true })
  metadata: Metadata;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  chain: string;

  @Prop({ required: true })
  supply: number;

  @Prop({ required: true })
  contract_address: string;

  @Prop({ required: true })
  contract_type: string;

  @Prop({ default: false })
  is_listed: boolean;

  @Prop({ required: true })
  creator: string;
}

export const NFTSchema = SchemaFactory.createForClass(NFT);
NFTSchema.index({ item_id: 1, tx_hash: 1 }, { unique: true });
