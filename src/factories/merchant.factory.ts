import JumperExchange from '../providers/jumper.provider';

enum MERCHANT {
    JUMPER = 'jumper-exchange'
};

enum ERROR {
    INVALID_MERCHANT = 'INVALID_MERCHANT'
}


export const getMerchantForSwapTransaction = (key: string): any => {
    switch(key) {
        case MERCHANT.JUMPER:
            return JumperExchange
        default:
            return ERROR.INVALID_MERCHANT;
    }
}