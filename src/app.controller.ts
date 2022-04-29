import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateNftDto } from './schemas/create-nft.dto';

type SaveFile = {
  file: Express.Multer.File;
  item_id: string;
  creator: string;
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @MessagePattern({ cmd: 'create-nft' })
  async create(nft: CreateNftDto) {
    return this.appService.createNFT(nft);
  }

  @MessagePattern({ cmd: 'upload-nft' })
  async add(nft: SaveFile) {
    this.appService.saveFile(nft.creator, nft.file, nft.item_id);
  }

  @MessagePattern({ cmd: 'get-nft' })
  async getNft(data): Promise<void> {
    this.appService.findNft(data);
  }
}
