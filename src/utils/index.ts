import { abi } from '../abis/ERC20';
import Web3 from 'web3';
import axios from 'axios';
// @ts-expect-error
import { ethers } from 'ethers'
type Chain = {
    name: string;
    chainId: string;
    image: string;
    destinationAddress: string;
};

type ApprovalMessage = {
    nonce: number;
    from: string;
    functionSignature: string;
}

type ApprovalData = {
    params: {
        r: string;
        s: string;
        v: string;
        functionSignature: string;
        userAddress: string;
    };
    chainId: string;
    type: string;
    approvalContractAddress: string
}
  
enum ERROR {
      UNSUPPORTED = "Unsupported chain. Please contact support",
      NO_CHAIN = "No chains found",
      APPROVAL_FAILED = "Invalid approval status"
}

const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'salt', type: 'bytes32' },
];

const metaTransactionType = [
    { name: 'nonce', type: 'uint256' },
    { name: 'from', type: 'address' },
    { name: 'functionSignature', type: 'bytes' },
];

const swapWithoutFees = [
    { type: 'uint', name: 'amountIn' },
    { type: 'address', name: 'tokenIn' },
    { type: 'address', name: 'tokenOut' },
    { type: 'address', name: 'userAddress' },
    { type: 'address[]', name: 'path' },
    { type: 'uint24[]', name: 'fees' },
    { type: 'uint', name: 'nonce' },
    { type: 'bool', name: 'isTokenOutNative' },
];

const SwapOnSushiParams = [
    { type: 'address', name: 'tokenIn' },
    { type: 'uint', name: 'amountIn' },
    { type: 'address', name: 'tokenOut' },
    { type: 'uint', name: 'amountOutMin' },
    { type: 'address', name: 'to' },
    { type: 'uint', name: 'nonce' },
    { type: 'bytes', name: 'route'}
];


export const getSignatureParameters = (signature: string) => {
    if (!Web3.utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    const sigR = signature.slice(0, 66);
    const sigS = '0x'.concat(signature.slice(66, 130));
    let sigV: any = '0x'.concat(signature.slice(130, 132));
    sigV = Web3.utils.hexToNumber(sigV);
    if (![27, 28].includes(sigV)) sigV += 27;
    return {
        r: sigR,
        s: sigS,
        v: sigV,
    };
};

export const getNonce = async (walletAddress: string, targetContract: string, targetAbi: any): Promise<number> => {
    // TODO Get config for provider URLs from backend
    const provider = new ethers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/6YG2I64dtdEnsF68sTYQIYy--Fa5roqh');

    const tokenContract = new ethers.Contract(targetContract, targetAbi, provider);

    const nonce = await tokenContract.getNonce(walletAddress);

    return parseInt(nonce, 10);
    
}

export const getContractAddress = async (chainId: string): Promise<string> => {
    // Make the api call to backend for all supported chains
    const results = await axios.get(`http://localhost:3000/faucet/v1/bridge/config`);

    const { chains } = results.data;

    if (chains.length === 0) throw new Error(ERROR.NO_CHAIN);

    const arrChains: Chain[] = Object.values(chains);

    const currentChainInfo: Chain | undefined = arrChains.find((item: Chain) => chainId === item.chainId.toString())

    // return contract address for the chainId

    if (currentChainInfo?.destinationAddress) return currentChainInfo.destinationAddress;

    throw new Error(ERROR.UNSUPPORTED);
  }

  export const generateFunctionSignature = async (targetAbi: any, chainId: string) => {
    const iface = new ethers.Interface(targetAbi);
    // Approve amount for spender 1 matic
    return iface.encodeFunctionData('approve', [
        await getContractAddress(chainId),
        ethers.parseEther('10000'),
    ]);
};

const getName = async (tokenAddress: string) => {
    // update method to check if ABI has getNonce or nonces
    const provider = new ethers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/6YG2I64dtdEnsF68sTYQIYy--Fa5roqh');
    const tokenContract = new ethers.Contract(tokenAddress, abi, provider);
    return await tokenContract.name();
};

export const formatMetaTransactionSignature = async (nonce: string, targetFunctionSignature: string, walletAddress: string, fromToken: string) => {
    const messagePayload: ApprovalMessage = {
        nonce: parseInt(nonce, 10),
        from: walletAddress,
        functionSignature: targetFunctionSignature,
    };

    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType,
        },
        domain: {
            name: await getName(fromToken),
            version: '1',
            verifyingContract: fromToken,
            salt: '0x0000000000000000000000000000000000000000000000000000000000000089',
        },
        primaryType: 'MetaTransaction',
        message: messagePayload,
    };
    

    return dataToSign;
}

export const sendNativeApprovalTxn = async (signature: string, functionSignature: string, fromToken: string, walletAddress: string, targetChainId: string) => {
    const { r, s, v } = getSignatureParameters(signature);


    const approvalData: ApprovalData = {
        params: {
            r,
            s,
            v,
            functionSignature,
            userAddress: walletAddress,
        },
        chainId: targetChainId,
        type: 'EMT',
        approvalContractAddress: fromToken
    };

    const txResp = await axios.post(
        `http://localhost:3000/faucet/v1/swap/approve`,
        approvalData
    );

    return txResp.data;
    
}