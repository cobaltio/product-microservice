import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NFT, NFTSchema } from './schemas/nft.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/products-microservice'),
    MongooseModule.forFeature([{ name: NFT.name, schema: NFTSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
