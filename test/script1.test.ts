import { GaspayManager } from '../src/gaspay';
import { expect } from 'chai';
import { getContractAddress, getNonce } from '../src/utils';
const polygonAdd = '0x9632b2A066b95A1521a8774F7367882681C6ACF1'
import { abi } from '../src/abis/ERC20';

const sigUtil = require('@metamask/eth-sig-util');
require('dotenv').config()

enum ERROR {
    NO_SIGNATURE = 'Invalid signature'
}

describe('Testing chains info',  async () => {
    let gasypayManager: GaspayManager;
    before('Setting up Gaspay manager', () => {
        gasypayManager = new GaspayManager('7128931bksjdbfkj-fdsfsui8dfsf');
    })

    it('Checking for contract address for a given chain id', async () => {
        const contractAddress = await getContractAddress('137');
        expect(contractAddress).equal(polygonAdd);
    });

    it ('Getting nonce', async () => {
        const nonce = await getNonce('0xd7C9F3b280D4690C3232469F3BCb4361632bfC77', '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', abi);

        expect(nonce).greaterThan(0);
    });

    it('Approval testing', async function () {
        this.timeout(10000);
        const { dataToSign, functionSignature } = await gasypayManager.generateApprovalSignature(
            '0xd7C9F3b280D4690C3232469F3BCb4361632bfC77',
            '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            '137'
        );

        let signature: string | undefined = undefined;

        // Sign with private key
        if (process.env.PK) {
            console.log('Signing data...', dataToSign, '\t', process.env.PK);
            signature = await sigUtil.signTypedData({
                privateKey: Buffer.from(process.env.PK.slice(2), "hex"),
                data: dataToSign,
                version: "V4"
            });

            console.log('reached herer', signature);
            
        }

        if (!signature) throw new Error(ERROR.NO_SIGNATURE);

        const txDetails = await gasypayManager.sendApprovalTransaction(
            signature,
            functionSignature,
            '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            '0xd7C9F3b280D4690C3232469F3BCb4361632bfC77',
            '137'
        );

        const hashPresent = txDetails.hash ? true: false;

        expect(hashPresent).equal(true);

    })
});
