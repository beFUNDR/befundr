import { Keypair, PublicKey } from "@solana/web3.js";
import {
    createMint,
    Account,
    mintTo,
    getAccount,
    getOrCreateAssociatedTokenAccount,
    getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { context, PROGRAM_CONNECTION } from "../config";
import { createUserWalletWithSol } from "../utils"
import { BN } from "@coral-xyz/anchor";
import { IS_BANKRUN_ENABLED, setupATA } from "../bankrun/bankrunUtils";
import { AccountInfoBytes } from "solana-bankrun";
export const USDC_MINT_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const MINT_DECIMALS = 6;
var MINT_ADDRESS: PublicKey;
var MINT_AUTHORITY: Keypair;

/**
 * Initializes a new mint token account on the Solana blockchain.
 * 
 * This mint is a mockup USDC token used for tests purposes
 * 
 * This function performs the following steps:
 * 1. Creates a new user wallet and funds it with SOL.
 * 2. Generates a new keypair to act as the mint authority.
 * 3. Creates a new mint with the specified parameters, including the connection to the Solana network,
 *    the payer of the transaction fees, the public key of the mint authority, and the number of decimal places for the token.
 * 4. Stores the mint address and authority in global variables for later use.
 * 5. Logs the details of the new mint token account, including the mint address and mint authority public key.
 * 
 * @async
 * @function InitMint
 * @returns {Promise<void>} A promise that resolves when the mint token account has been successfully created.
 */
const InitMint = async () => {
    // Create a new user wallet and fund it with SOL
    const payer = await createUserWalletWithSol();

    // Generate a new keypair to act as the mint authority
    const mintAuthority = Keypair.generate();

    // Create a new mint with the specified parameters
    const mintAddress = await createMint(
        PROGRAM_CONNECTION, // Connection to the Solana network
        payer,              // Payer of the transaction fees
        mintAuthority.publicKey, // Public key of the mint authority
        null,               // Freeze authority (null means no freeze authority)
        MINT_DECIMALS,      // Number of decimal places for the token (6 to match USDC)
    );

    // Store the mint address and authority in global variables
    MINT_ADDRESS = mintAddress;
    MINT_AUTHORITY = mintAuthority;

    return { MINT_ADDRESS, MINT_AUTHORITY };
}

/**
 * Converts an amount to the token's decimal format.
 * 
 * @param {number} amount - The amount to convert.
 * @returns {number} The amount in the token's decimal format.
 */
const convertAmountToDecimals = (amount: number): BN => {
    return new BN(amount * 10 ** MINT_DECIMALS);
}

/**
 * Convert an amount from the token's decimal format to the original format.
 * 
 * @param {number} amount - The amount in the token's decimal format.
 * @returns {number} The original amount.
 */
const convertFromDecimalsToAmount = (amount: number): BN => {
    return new BN(amount / 10 ** MINT_DECIMALS);
}

export const INITIAL_USER_ATA_BALANCE = convertAmountToDecimals(10000);

/**
 * Creates a new associated token account for the given payer.
 * 
 * @param {Keypair} payer - The payer of the transaction fees.
 * @returns {Promise<Account>} The created associated token account.
 */
const newAssociatedTokenAccount = async (payer: Keypair): Promise<Account | AccountInfoBytes | null> => {
    if (IS_BANKRUN_ENABLED) {
        const ataPubkey = setupATA(context, USDC_MINT_ADDRESS, payer.publicKey);
        return await context.banksClient.getAccount(ataPubkey);
    }
    // Create new mint account
    if (typeof MINT_ADDRESS === 'undefined') {
        await InitMint();
    }

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        PROGRAM_CONNECTION,
        payer,
        MINT_ADDRESS,
        payer.publicKey
    )

    return tokenAccount;
}

/**
 * Creates a new PDA associated token account for the given payer and project public key.
 * 
 * @param {Keypair} payer - The payer of the transaction fees.
 * @param {PublicKey} projectPubkey - The project public key.
 * @returns {Promise<PublicKey>} The created PDA associated token account public key.
 */
const newPdaAssociatedTokenAccount = async (payer: Keypair, projectPubkey: PublicKey): Promise<PublicKey> => {

    // Create new mint account
    if (typeof MINT_ADDRESS === 'undefined') {
        await InitMint();
    }

    const pdaAta = await getOrCreateAssociatedTokenAccount(
        PROGRAM_CONNECTION,
        payer,
        MINT_ADDRESS,
        projectPubkey,
        true,
    )

    return pdaAta.address;
}

/**
 * Mints a specified amount of tokens to the given account.
 * 
 * @param {Keypair} payer - The payer of the transaction fees.
 * @param {PublicKey} toAccount - The account to mint tokens to.
 * @param {BN} amount - The amount of tokens to mint.
 */
const MintAmountTo = async (payer: Keypair, toAccount: PublicKey, amount: BN) => {
    // Mint supply
    await mintTo(
        PROGRAM_CONNECTION,
        payer,
        MINT_ADDRESS,
        toAccount,
        MINT_AUTHORITY,
        BigInt(amount.toString()),
    );
}

const getTokenAccountBalance = async (address: PublicKey, isPda?: boolean): Promise<BN> => {
    const tokenAccount: PublicKey = getAssociatedTokenAddressSync(MINT_ADDRESS, address, isPda ?? false);
    const account = await getAccount(PROGRAM_CONNECTION, tokenAccount);

    return new BN(account.amount);
}

export const getAtaBalance = async (ataAddress: PublicKey): Promise<BN> => {
    const account = await getAccount(PROGRAM_CONNECTION, ataAddress);
    return new BN(account.amount);
}

export {
    MINT_ADDRESS,
    MINT_DECIMALS,
    InitMint,
    newAssociatedTokenAccount,
    newPdaAssociatedTokenAccount,
    MintAmountTo,
    convertAmountToDecimals,
    convertFromDecimalsToAmount,
    getTokenAccountBalance,
}