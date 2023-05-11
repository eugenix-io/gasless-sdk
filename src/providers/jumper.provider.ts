import axios from 'axios';
import { getFlintContractDetails, getSignatureParameters } from '../utils';
import Web3 from 'web3';

// @ts-expect-error
import { Contract } from 'ethers';

interface SwapData {
    callTo: string;
    approveTo: string;
    sendingAssetId: string;
    receivingAssetId: string;
    fromAmount: string;
    callData: string;
    requiresDeposit: boolean;
}
interface JumperExchangeParams {
    transactionId: string
    integrator: string;
    referrer: string;
    receiver: string;
    minAmount: string;
    swapData: SwapData

}

type ContractDetails = {
    flintContract: Contract;
    contractAddress: string;
}

const SwapWithJumperGasless = [
    { type: 'uint', name: 'nonce' },
    { type: 'uint', name: 'minAmount'},
    { type: 'address', name: 'receiver'},
    { type: 'bytes32', name: 'transactionId'}
];

const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' },
];

const swapTransaction = async (signature: string, params: JumperExchangeParams, chainId: string, walletAddress: string, merchantApiKey: string) => {
    // send to relayer

    const contractDetails: ContractDetails | undefined = await getFlintContractDetails(chainId);

    const flintContract = contractDetails?.flintContract;

    const NONCE = await flintContract?.nonces(walletAddress);

    const { r, s, v } = getSignatureParameters(signature);

    const payload = {
        params,
        sigR: r,
        sigS: s,
        sigV: v,
        chainId,
        nonce: parseInt(NONCE, 10),
        walletAddress,
        merchantApiKey
    };

    const resp = await axios.post(
        `http://localhost:3000/faucet/v1/swap/gasless-merchant-swap`,
        payload
    )
}

const getSwapSignature = async (params: JumperExchangeParams, chainId: string, walletAddress: string): Promise<unknown | undefined> => {
    try {

        console.log(params, "Params for swap...");
        
            
        const contractDetails: ContractDetails | undefined = await getFlintContractDetails(chainId);
        const flintContract = contractDetails?.flintContract;
        const contractAddress = contractDetails?.contractAddress;

        const NONCE = await flintContract?.nonces(walletAddress);

        console.log(NONCE, "NONCE for flint contract!!");
        

        const {
            transactionId,
            integrator,
            referrer,
            receiver,
            minAmount,
            swapData
        } = params;

        // Format message to be signed
        const messagePayload = {
            nonce: parseInt(NONCE, 10),
            minAmount,
            receiver,
            transactionId
        };

        const salt = Web3.utils.padLeft(`0x${parseInt(chainId).toString(16)}`, 64);

        console.log(salt, "Salt here$$$");
        

        // const salt = '0x0000000000000000000000000000000000000000000000000000000000000089';

        const dataToSign = {
            types: {
                EIP712Domain: domainType,
                SwapWithoutFeesJumper: SwapWithJumperGasless,
            },
            domain: {
                name: await flintContract?.name(),
                version: '1',
                verifyingContract: contractAddress,
                salt,
            },
            primaryType: 'SwapWithoutFeesJumper',
            message: messagePayload,
        };

        return dataToSign;
    } catch (error) {
        console.log(error, 'Error in getSwapSignature');
    }

}

const getKey = (): string => {
    return 'jumper-exchange'
};

export default {
    swapTransaction,
    getKey,
    getSwapSignature
}


