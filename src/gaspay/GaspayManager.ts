import axios from 'axios';

type chain = {
  name: string;
  chainId: string;
  image: string;
  destinationAddress: string;
};

export class GaspayManager {
  protected apiKey;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getContractAddress(chainId: string): Promise<string | null> {
    // Make the api call to backend for all supported chains
    let results = await axios.get(`http://localhost:3000/faucet/v1/bridge/config`);

    const { chains } = results.data;

    // console.log(chains, 'Chains..');
    

    if (chains.length === 0) return null

    console.log(Object.values(chains), 'values');

    const arrChains: chain[] = Object.values(chains);

    const currentChainInfo: chain | undefined = arrChains.find((chain: chain) => chainId === chain.chainId.toString())

    // return contract address for the chainId

    console.log(currentChainInfo, 'currentChainInfo $$');
    

    return currentChainInfo ? currentChainInfo.destinationAddress : null;
  }
};