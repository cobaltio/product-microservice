import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NFT, NFTSchema } from './schemas/nft.schema';
import { ContractsService } from './contracts/contracts.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Web3 from 'web3';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/products-microservice'),
    MongooseModule.forFeature([{ name: NFT.name, schema: NFTSchema }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: ContractsService,
      useFactory: async (configService: ConfigService) => {
        return new ContractsService(
          configService.get<string>('PRIVATE_KEY'),
          configService.get<string>('PUBLIC_KEY'),
          configService.get<string>('CONTRACT_ADDRESS'),
          new Web3(configService.get('API_URL')),
        );
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
