import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { setProvider } from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import { systemProgram } from "../config";
import { getAccount as getAccountBankrun } from "spl-token-bankrun";

export const IS_BANKRUN_ENABLED: boolean = process.env.BANKRUN_ENABLED == "true";
const INIT_BALANCE_LAMPORTS: number = 500_000_000_000;

/**
 * Initializes the Bankrun environment by setting up the necessary context and provider.
 *
 * @async
 * @returns {Promise<[ProgramTestContext, BankrunProvider]>} A promise that resolves to a tuple containing the initialized ProgramTestContext and BankrunProvider.
 */
export const initBankrun = async (): Promise<[ProgramTestContext, BankrunProvider]> => {
    const context: ProgramTestContext = await startAnchor("", [], []);
    const provider = new BankrunProvider(context);
    setProvider(provider);
    return [context, provider];
}

/**
 * Creates a new account with the specified amount of lamports.
 *
 * @param {ProgramTestContext} context - The context in which to create the account.
 * @param {number} [lamportsAmount=INIT_BALANCE_LAMPORTS] - The amount of lamports to initialize the account with.
 * @returns {Keypair} The keypair associated with the newly created account.
 * @throws {Error} If the context is not initialized.
 */
export const createAccount = (context: ProgramTestContext, lamportsAmount: number = INIT_BALANCE_LAMPORTS): Keypair => {
    if (!context) {
        throw new Error("Context not initialized");
    }
    const keypair = new Keypair();
    context.setAccount(keypair.publicKey, {
        lamports: lamportsAmount,
        data: Buffer.alloc(0),
        owner: systemProgram.programId,
        executable: false,
    });

    return keypair;
}

/**
 * Retrieves the Associated Token Account (ATA) for a given address.
 *
 * @async
 * @param {BanksClient} banksClient - The client used to interact with the bank.
 * @param {PublicKey} ataAddress - The address of the Associated Token Account to retrieve.
 * @returns {Promise<any | null>} A promise that resolves to the ATA if found, or null if an error occurs.
 */
export const getAta = async (banksClient: BanksClient, ataAddress: PublicKey): Promise<any | null> => {
    try {
        return await getAccountBankrun(banksClient, ataAddress);
    } catch (e) {
        return null;
    }
}

/**
 * Retrieves the balance of a given account in lamports.
 *
 * @async
 * @param {BanksClient} banksClient - The client used to interact with the bank.
 * @param {PublicKey} accountAddress - The address of the account to retrieve the balance for.
 * @returns {Promise<number | null>} A promise that resolves to the account balance in lamports, or null if the account does not exist.
 */
export const getAccountBalance = async (banksClient: BanksClient, accountAddress: PublicKey): Promise<number | null> => {
    const account = await banksClient.getAccount(accountAddress);
    return account?.lamports ?? null;
}
