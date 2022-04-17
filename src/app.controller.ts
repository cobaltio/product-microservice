import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateNftDto } from './schemas/create-nft.dto';
import { NFTEntity } from './schemas/nft.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @MessagePattern({ cmd: 'create-nft' })
  async create(nft: CreateNftDto): Promise<NFTEntity | void> {
    return new NFTEntity(await this.appService.createNFT(nft));
  }

  @MessagePattern({ cmd: 'add-nft' })
  async add(nft) {
    this.appService.createNFT(nft);
  }

  @MessagePattern({ cmd: 'get-nft' })
  async getNft(data): Promise<void> {
    this.appService.findNft(data);
  }
}