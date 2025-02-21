import { ProgramTestContext } from 'solana-bankrun';
import { Befundr } from '../src';
import { getProvider, Program, Provider, web3, workspace } from '@coral-xyz/anchor';
import { initBankrun, IS_BANKRUN_ENABLED } from './bankrun/bankrunUtils';

let context: ProgramTestContext;
let provider: Provider;
let program: Program<Befundr>;

beforeAll(async () => {
    if (IS_BANKRUN_ENABLED) {
        [context, provider, program] = await initBankrun();
        console.log("Using Bankrun");
    } else {
        provider = getProvider();
        program = workspace.Befundr as Program<Befundr>;
        console.log("Using Solana local validator");
    }
});

export { context, provider, program };
export const PROGRAM_CONNECTION = getProvider().connection;

export const systemProgram = web3.SystemProgram;