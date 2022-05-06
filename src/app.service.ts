import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { writeFile } from 'fs';
import { CreateNftDto } from './schemas/create-nft.dto';
import { Metadata, NFT, NFTDocument } from './schemas/nft.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import mintNftContract from './contracts/MyNFT.json';
import { AbiItem } from 'web3-utils';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import sha3 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';
import {
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
  MessageTypes,
} from '@metamask/eth-sig-util';

@Injectable()
export class AppService {
  private contract: Contract;
  private readonly private_key: string; // private key of wallet which deployed the smart contract.
  private readonly contract_address: string;
  private web3: Web3;

  constructor(
    @InjectModel(NFT.name) private nftModel: Model<NFTDocument>,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.private_key = this.configService.get<string>('PRIVATE_KEY');
    this.contract_address = this.configService.get<string>('CONTRACT_ADDRESS');
    this.web3 = new Web3(this.configService.get('API_URL'));

    this.contract = new this.web3.eth.Contract(
      mintNftContract.abi as AbiItem[],
      this.contract_address,
    );

    this.contract.events
      .Transfer(undefined, function (error, event) {
        if (error) console.log(error);
      })
      .on('data', (event) => {
        const values = event.returnValues;
        const token_id: string = values.tokenId.toString();

        this.cacheManager.get<string>(token_id).then((res) => {
          const nft = JSON.parse(res);
          if (nft) {
            const created_nft: NFTDocument = new this.nftModel({
              ...nft,
              tx_hash: event.transactionHash,
              item_id: token_id,
              contract_address: this.contract_address,
              contract_type: 'ERC721',
              supply: 1,
              chain: 'ETH',
            });

            created_nft.save(function (err) {
              if (err) console.log(err);
              else console.log(`NFT with token id ${token_id} minted`);
            });
          }
        });
      })
      .on('connected', function (subscriptionId) {
        // console.log(subscriptionId);
      });
  }

  saveFile(owner: string, file: Express.Multer.File, filename: string) {
    // Check if a transaction was created for the particular token_id or filename
    return this.cacheManager.get<string>(filename).then((res) => {
      if (!res) throw new Error('No create transaction found');
      // rejects if not found
      else {
        const nft: CreateNftDto = JSON.parse(res);
        if (nft.owner === owner) {
          // write to file in folder ./data/
          const mimetype = file.mimetype;
          const extension = mimetype
            .substring(mimetype.lastIndexOf('/') + 1)
            .toLowerCase();
          writeFile(
            `./data/${filename}.${extension}`,
            Buffer.from(file.buffer),
            (err) => {
              if (err) console.log(err);
            },
          );
        } else {
          throw new Error('No such NFT found');
        }
      }
    });
  }

  async createNFT(nft: CreateNftDto) {
    const creator = nft.creator;
    const web_url = this.configService.get<string>('WEB_ADDRESS');

    // Generate token_id by hashing metadata
    const nft_string: string = JSON.stringify(nft);
    const nft_hash = sha3(Date.now() + nft_string, {
      outputLength: 256,
    }).toString(CryptoJS.enc.Hex);
    const token_id = BigInt('0x' + nft_hash).toString(10);

    const deadline = Date.now() + 5 * 60 * 1000;

    const metadata_uri = `${web_url}/products/metadata/${token_id}`;

    nft.metadata.image = `${web_url}/products/media/${token_id}`;

    const domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];

    const createNft = [
      { name: 'recipient', type: 'address' },
      { name: 'tokenURI', type: 'string' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];

    const domainData = {
      name: 'Desi-NFT',
      version: '0.0.1',
      chainId: await this.web3.eth.net.getId(),
      verifyingContract: this.contract_address,
    };

    const message = {
      recipient: creator,
      tokenURI: metadata_uri,
      tokenId: token_id,
      deadline: deadline,
    };

    const data: TypedMessage<MessageTypes> = {
      types: {
        EIP712Domain: domain,
        createNft: createNft,
      },
      domain: domainData,
      primaryType: 'createNft',
      message: message,
    };

    this.cacheManager.set(token_id.toString(), nft_string, { ttl: 5 * 60 });
    const signed = signTypedData({
      privateKey: Buffer.from(this.private_key, 'hex'),
      data: data,
      version: SignTypedDataVersion.V3,
    }).substring(2);

    const tx = {
      from: creator,
      to: this.contract_address,
      data: this.contract.methods
        .mintNFT(
          creator,
          metadata_uri,
          token_id,
          deadline,
          parseInt(signed.substring(128, 130), 16),
          `0x${signed.substring(0, 64)}`,
          `0x${signed.substring(64, 128)}`,
        )
        .encodeABI(),
    };
    return { token_id: token_id, tx: tx };
  }

  updateOwner(item_id: string, owner: string) {
    this.nftModel.updateOne({ item_id: item_id }, { owner: owner });
  }

  async findNft(data) {
    const { owner } = await this.nftModel.findOne(...data).exec();
    return owner;
  }
}
