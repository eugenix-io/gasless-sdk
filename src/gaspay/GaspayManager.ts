import axios from 'axios';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { abi } from '../abis/ERC20';
import { getNonce, generateFunctionSignature, formatMetaTransactionSignature, sendNativeApprovalTxn } from '../utils';

type ApprovalSignature = {
    dataToSign: any;
    functionSignature: string;
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

    let functionSignature = await generateFunctionSignature(abi, chainId);

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

};