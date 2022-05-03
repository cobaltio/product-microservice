import { IsNotEmpty } from 'class-validator';
import { Metadata } from './nft.schema';

export class CreateNftDto {
  @IsNotEmpty()
  metadata: Metadata;

  supply: number;

  chain: string;

  @IsNotEmpty()
  creator: string;

  @IsNotEmpty()
  owner: string;
}
