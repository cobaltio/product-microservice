import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollectionDocument = Collection & Document;

@Schema()
export class Collection {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  supply: string;

  @Prop({ required: true })
  creator: string;

  @Prop()
  tokens: [string];

  @Prop({ required: true })
  chain: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
