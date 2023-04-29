
![Logo](https://dnj9s9rkg1f49.cloudfront.net/flint-logo-golden-black.svg)


# Flint Gasless SDK

Flint gasless SDK (Gaspay) does the magic of enabling *gasless* feature in any dApp with just a few lines of code. Users can pay in *ERC20* tokens to send transactions to the blockchain that needs native tokens otherwise.

## Installation

Recommended Node version 16 or higher

```bash
  npm install flint-gasless-sdk
```
    
## Documentation

```bash
import { GaspayManager } from "flint-gasless-sdk";

const gaspayManager = new GaspayManager("<FLINT_GASPAY_API_KEY>");

const { dataToSign, functionSignature } =
      await gaspayManager.generateApprovalSignature(
        <WALLET_ADDRESS>,
        <ERC20_TOKEN_ADDRESS>,
        <CHAIN_ID>
);

```

**Get the signature from the user**

You can use default ethereum injected by the wallet provider or wagmi to initiate a signature from the user in your dApp.

**Note:**
This will open metamask or any other ethereum wallet

```bash
const signature = await ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [walletAddress, JSON.stringify(dataToSign)],
    });
```

**Or**

You can read about signing typed data here: [wagmi](https://wagmi.sh/react/hooks/useSignTypedData)

```bash

import { useSignTypedData } from 'wagmi'

const signTypedData = useSignTypedData({
    domain,
    types,
    value,
    onSuccess(data) {
      console.log('Success', data)
      // Call gasless sdk on this data signature returned
    },
  })

```

**Finally send this transaction through the SDK**

```bash
const txDetails = await gaspayManager.sendApprovalTransaction(
        data,
        functionSig,
        <ERC20_TOKEN_ADDRESS>,
        <WALLET_ADDRESS>,
        <CHAIN_ID>
    );
```

And voilà!! You have gasless feature enabled in your dApp with just a few lines of code 🥳

## API Reference

#### Get all items

```bash
generateApprovalSignature(walletAddress: string, fromToken: string, chainId: string): Promise<ApprovalSignature>;
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `walletAddress` | `string` | **Required**. User wallet address connected to the dApp |
| `fromToken` | `string` | **Required**. ERC20 token in for approval |
| `chainId` | `string` | **Required**. Current chain id of the connected account |

#### Get item

```bash
  sendApprovalTransaction(signature: string, functionSignature: string, fromToken: string, walletAddress: string, chainId: string): Promise<any>;
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `signature`      | `string` | **Required**. Signature returned by the users ethereum wallet 
| `functionSignature`      | `string` | **Required**. function signature returned by flint gaspay manager
| `fromToken`      | `string` | **Required**. ERC20 token address for approval
| `walletAddress`      | `string` | **Required**. Wallet address of the connected user
| `chainId`      | `string` | **Required**. Current chain id of the connected account

#### add(num1, num2)

Takes two numbers and returns the sum.


## Authors

- [abhishek](https://github.com/abhishek-Kumar009)


## License

[MIT](https://choosealicense.com/licenses/mit/)

