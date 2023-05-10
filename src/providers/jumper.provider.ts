import axios from 'axios';
import { getFlintContractDetails, getSignatureParameters } from '../utils';

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
    _transactionId: string
    _integrator: string;
    _referrer: string;
    _receiver: string;
    _minAmount: string;
    _swapData: SwapData

}

const SwapWithJumperGasless = [
    {type: 'uint', name: 'nonce'},
];

const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' },
];

const swapTransaction = async (signature: string, params: JumperExchangeParams, chainId: string, walletAddress: string, merchantApiKey: string) => {
    // send to relayer

    const { flintContract, contractAddress } = getFlintContractDetails(chainId);

    const NONCE = await flintContract.getNonces(walletAddress);

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

const getSwapSignature = async (params: JumperExchangeParams, chainId: string, walletAddress: string) => {
    const { flintContract, contractAddress } = getFlintContractDetails(chainId);

    const NONCE = await flintContract.getNonces(walletAddress);

    const {
        _transactionId,
        _integrator,
        _referrer,
        _receiver,
        _minAmount,
        _swapData
    } = params;

    // Format message to be signed
    let message = {
        nonce: parseInt(NONCE, 10)
    };

    const salt = '0x0000000000000000000000000000000000000000000000000000000000000089';

    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            SwapWithoutFeesJumper: SwapWithJumperGasless,
        },
        domain: {
            name: await flintContract.getName(),
            version: '1',
            verifyingContract: contractAddress,
            salt,
        },
        primaryType: 'SwapWithoutFeesJumper',
        message: message,
    };

    return dataToSign;

}

const getKey = (): string => {
    return 'jumper-exchange'
};

export default {
    swapTransaction,
    getKey,
    getSwapSignature
}


