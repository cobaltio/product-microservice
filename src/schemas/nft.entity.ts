import { Metadata } from './nft.schema';

export class NFTEntity {
  item_id: number;
  tx_hash: string;
  owner: string;
  metadata: Metadata;
  chain: string;
  supply: number;
  contract_address: string;
  contract_type: string;
  creator: string;

  constructor(partial: Partial<NFTEntity>) {
    Object.assign(this, partial);
  }
}
