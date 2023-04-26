import { GaspayManager } from '../gaspay';

const polygonAdd = '0x9632b2A066b95A1521a8774F7367882681C6ACF1'

test('Testing chains info', async function() {
    const gasypayManager = new GaspayManager('7128931bksjdbfkj-fdsfsui8dfsf');
    const contractAddress = await gasypayManager.getContractAddress('137');

    expect(contractAddress).toBe(polygonAdd);
})