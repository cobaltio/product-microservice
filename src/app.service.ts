import { Injectable } from '@nestjs/common';
import { CreateNftDto } from './schemas/create-nft.dto';
import { NFT, NFTDocument } from './schemas/nft.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ContractsService, mintTxResult } from './contracts/contracts.service';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    private contractsService: ContractsService,
  ) {}

  async createNFT(nft: CreateNftDto): Promise<NFTDocument> {
    const tx_result: mintTxResult = await this.contractsService.mint(
      nft.creator,
      nft.metadata,
    );

    const created_nft: NFTDocument = new this.nftModel({
      ...nft,
      ...tx_result,
    });

    created_nft.save(function (err) {
      if (err) console.log(err);
    });

    return created_nft;
  }

  addNFT(nft) {
    //distinguish between nft's. How??
  }

  deleteNFT(nft) {
    // what's unique in an nft?
  }

  findNft(data) {
    this.nftModel.find(...data);
  }
}
