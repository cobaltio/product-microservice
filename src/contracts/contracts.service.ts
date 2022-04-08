import { Injectable } from '@nestjs/common';
import { Metadata } from 'src/schemas/nft.schema';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import mintNftContract from './smart-contracts/mintNFT.sol/MyNFT.json';

export type mintTxResult = {
  tx_hash: string;
  item_id: string;
  contract_address: string;
  contract_type: string;
  supply: number;
  chain: string;
  owner: string;
};

@Injectable()
export class ContractsService {
  private nftContract: Contract;
  constructor(
    private readonly private_key: string, // private key of wallet which deployed the smart contract.
    private readonly public_key: string, // public key of wallet which deployed the smart contract.
    private readonly contract_address: string,
    private web3: Web3,
  ) {
    this.nftContract = new this.web3.eth.Contract(
      mintNftContract.abi as AbiItem[],
      this.contract_address,
    );
  }

  async mint(creator: string, metadata: Metadata): Promise<mintTxResult> {
    const nonce = await this.web3.eth.getTransactionCount(
      this.public_key,
      'latest',
    ); //get latest nonce

    //the transaction
    const tx = {
      from: this.public_key,
      to: this.contract_address,
      nonce: nonce,
      gas: 500000,
      data: this.nftContract.methods.mintNFT(creator, metadata).encodeABI(),
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(
      tx,
      this.private_key,
    );

    const itemid = await this.nftContract.methods // Replace with events listening
      .mintNFT(creator, metadata)
      .call({ from: this.public_key });

    // send the transaction to the blockchain
    const txResult: Promise<mintTxResult> = new Promise<mintTxResult>(
      (resolve, reject) => {
        this.web3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          (err, hash) => {
            if (!err) {
              resolve({
                tx_hash: hash,
                item_id: itemid,
                contract_address: this.contract_address,
                contract_type: 'ERC721',
                chain: 'ETHEREUM',
                supply: 1,
                owner: creator,
              });
            } else {
              reject(err);
            }
          },
        );
      },
    );

    return txResult;
  }
}
