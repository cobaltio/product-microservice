import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { readFileSync } from 'fs';
import { AppService } from './app.service';
import { CreateNftDto } from './schemas/create-nft.dto';
import * as fs from 'fs';
import { resolve } from 'path';
import { rejects } from 'assert';
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
    try {
      await this.appService.saveFile(nft.creator, nft.file, nft.item_id);
    } catch (err) {
      return new RpcException(err);
    }
  }

  @MessagePattern({ cmd: 'get-nft' })
  async getNft(data) {
    return this.appService.findNft(data);
  }

  @MessagePattern({ cmd: 'find-nft' })
  async findNft(data) {
    return this.appService.getNft(data);
  }

  @MessagePattern({ cmd: 'get-media' })
  async getMedia(id) {
    return new Promise((resolve, reject) => {
      fs.readdir('./data/', (err, files) => {
        files.forEach((filename) => {
          if (filename.startsWith(id)) {
            const file = readFileSync(`./data/${filename}`);
            resolve({
              file: file,
              mimetype: `image/${filename.substring(
                filename.lastIndexOf('.') + 1,
              )}`,
            });
          }
        });
        reject('No file found');
      });
    });
  }

  @MessagePattern({ cmd: 'update-owner' })
  async updateOwner(data) {
    await this.appService.updateOwner(data.item_id, data.owner);
  }

  @MessagePattern({ cmd: 'set-listed' })
  async setListed(data) {
    this.appService.setListed(data);
  }
}
