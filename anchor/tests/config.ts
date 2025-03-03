import { ProgramTestContext } from 'solana-bankrun';
import { Befundr, BefundrIDL } from '../src';
import { getProvider, Program, Provider, web3 } from '@coral-xyz/anchor';
import { initBankrun, IS_BANKRUN_ENABLED } from './bankrun/bankrunUtils';
import { initMint } from './utils/tokenUtils';
import { BankrunProvider } from 'anchor-bankrun';

let context: ProgramTestContext;
let provider: Provider | BankrunProvider;
let program: Program<Befundr>;

beforeAll(async () => {
    if (IS_BANKRUN_ENABLED) {
        [context, provider] = await initBankrun();
    } else {
        provider = getProvider();
    }
    // @ts-ignore
    program = new Program<Befundr>(BefundrIDL as Befundr, provider);
    await initMint();
});

export { context, provider, program };
export const PROGRAM_CONNECTION = getProvider().connection;

export const systemProgram = web3.SystemProgram;