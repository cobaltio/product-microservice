import { IsNotEmpty } from 'class-validator';
import { Metadata } from './nft.schema';

export class CreateNftDto {
  @IsNotEmpty()
  metadata: Metadata;

  @IsNotEmpty()
  file: Express.Multer.File;

  supply: number;

  chain: string;

  @IsNotEmpty()
  creator: string;
}
