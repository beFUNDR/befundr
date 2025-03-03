import { PublicKey, AccountInfo } from "@solana/web3.js";

/**
 * This is the AccountInfo of the USDC mint account on main net
 */
export const USDC_ACCOUNT: AccountInfo<Buffer> = {
  data: Buffer.from(new Uint8Array([
    1, 0, 0, 0, 152, 254, 134, 232, 141, 155, 226, 234, 139, 193, 204, 164,
    135, 139, 41, 136, 194, 64, 245, 43, 132, 36, 191, 180, 14, 209, 162, 221,
    203, 94, 25, 155, 110, 199, 11, 136, 54, 46, 10, 0, 6, 1, 1, 0, 0, 0, 98,
    112, 170, 138, 89, 197, 148, 5, 180, 82, 134, 200, 103, 114, 230, 205, 18,
    110, 155, 138, 93, 58, 56, 83, 109, 55, 247, 180, 20, 232, 182, 103,
  ])),
  executable: false,
  lamports: 319181599414,
  owner: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  rentEpoch: 18446744073709552000,
};
