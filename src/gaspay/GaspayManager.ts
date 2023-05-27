import { abi } from '../abis/ERC20';
import { getMerchantForSwapTransaction } from '../factories/merchant.factory';
import { getNonce, generateFunctionSignature, formatMetaTransactionSignature, sendNativeApprovalTxn, getGaspayConfig } from '../utils';

type ApprovalSignature = {
    dataToSign: any;
    functionSignature: string;
}

type Provider = {
  chainId: string;
  rpcUrl: string;
  flintContract: string;
}

type GaspayConfig = {
  contractUrl: string;
  providerUrl: string;
  contractABI: any;
}

const providers: Record<number, Provider> = {
  137: {
    chainId: '137',
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/6YG2I64dtdEnsF68sTYQIYy--Fa5roqh',
    flintContract: ''
  }
}

export class GaspayManager {
  protected apiKey;
  /**
   * apiKey to initialize the Gaspaymanager
   * This api key is going to be used for backend api calls
   * business using this sdk must get this api key from Flint
   * @param apiKey 
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // TODO Download the config from backend on initalization
    // Things like provider Urls, flint contract info etc
  }

  /**
   * 
   * @param walletAddress User current signed in wallet address
   * @param fromToken From token selected in the UI for swap
   * @param chainId chain id for selected network
   * @returns approval signature to be passed to the frontend
   */

  public async generateApprovalSignature (walletAddress: string, fromToken: string, chainId: string): Promise<ApprovalSignature> {
    const nonce: number = await getNonce(walletAddress, fromToken, abi);

    const functionSignature = await generateFunctionSignature(abi, chainId);

    const dataToSign = await formatMetaTransactionSignature(nonce.toString(), functionSignature, walletAddress, fromToken);

    // TODO Return this as JSON.stringify(dataToSign) for metamask signing from user side 

    return { dataToSign, functionSignature };
  }

  /**
   * 
   * @param signature EIP2771 compatible Native meta transaction
   * @param functionSignature signature of the function to be used in meta transaction
   * @param fromToken from token selected in the swap frontend
   * @param walletAddress user's wallet address
   * @returns transaction data from blockchain
   */

  public async sendApprovalTransaction (signature: string, functionSignature: string, fromToken: string, walletAddress: string, chainId: string): Promise<any> {

    const approvalData = await sendNativeApprovalTxn(signature, functionSignature, fromToken, walletAddress, chainId);

    return approvalData;

  }

  /**
   * 
   * @param merchantApiKey Merchant API key given by Flint to merchant on onboarding
   * @param params Params required to sign 
   * @param chainId connected chainId of user wallet
   * @param walletAddress connected user's wallet address
   * @returns signature to be signed by user
   */

  public async generateSwapSignature (merchantApiKey: string, params: any, chainId: string, walletAddress: string): Promise<string | undefined> {
    // Get the provider
    const swapProvider: any = getMerchantForSwapTransaction(merchantApiKey);
    const sigToSign = await swapProvider.getSwapSignature(params, chainId, walletAddress);

    return sigToSign;
  }

  public async sendSwapTransaction (merchantApiKey: string, signature: string, params: any, chainId: string, walletAddress: string): Promise<any> {
    // Get the provider
    const swapProvider: any = getMerchantForSwapTransaction(merchantApiKey);
    const resp = await swapProvider.swapTransaction(signature, params, chainId, walletAddress, merchantApiKey);

    return resp;
  }

  public async getGaspayConfigForCurrentSession (chainId: string) {
    const result: GaspayConfig | undefined = await getGaspayConfig(chainId);
    return result;
  }

};
