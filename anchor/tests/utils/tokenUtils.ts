import { Keypair, PublicKey } from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { context, PROGRAM_CONNECTION } from "../config";
import { createUserWalletWithSol } from "./testUtils"
import { BN } from "@coral-xyz/anchor";
import { getAta, IS_BANKRUN_ENABLED } from "../bankrun/bankrunUtils";

import {
    createMint,
    mintTo,
    createAccount,
} from "spl-token-bankrun";

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
 * @function initMint
 * @returns {Promise<void>} A promise that resolves when the mint token account has been successfully created.
 */
const initMint = async (): Promise<{ MINT_ADDRESS: PublicKey, MINT_AUTHORITY: Keypair }> => {
    // Create a new user wallet and fund it with SOL
    const payer = await createUserWalletWithSol();

    // Generate a new keypair to act as the mint authority
    const mintAuthority = Keypair.generate();
    let mintPubkey: PublicKey;
    if (IS_BANKRUN_ENABLED) {
        mintPubkey = await createMint(context.banksClient, payer, mintAuthority.publicKey, payer.publicKey, 9);
    } else {
        // Create a new mint with the specified parameters
        mintPubkey = await token.createMint(
            PROGRAM_CONNECTION, // Connection to the Solana network
            payer,              // Payer of the transaction fees
            mintAuthority.publicKey, // Public key of the mint authority
            null,               // Freeze authority (null means no freeze authority)
            MINT_DECIMALS,      // Number of decimal places for the token (6 to match USDC)
        );
    }

    // Store the mint address and authority in global variables
    MINT_ADDRESS = mintPubkey;
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
 * Creates a new Associated Token Account for the given payer, owner and mint address
 * 
 * @param {Keypair} payer - The payer of the transaction fees.
 * @param {PublicKey} owner - The owner's public key.
 * @param {PublicKey} mintAddress - The mint address. Default is the global MINT_ADDRESS.
 * @returns {Promise<PublicKey>} The created ATA public key.
 */
const getOrCreateATA = async (payer: Keypair, owner: PublicKey, mintAddress: PublicKey = MINT_ADDRESS): Promise<PublicKey> => {
    if (IS_BANKRUN_ENABLED) {
        const address = token.getAssociatedTokenAddressSync(mintAddress, owner, true);
        const account = await getAta(context.banksClient, address);
        if (account) {
            return account.address;
        };
        return await createAccount(context.banksClient, payer, mintAddress, owner);
    }

    const pdaAta = await token.getOrCreateAssociatedTokenAccount(
        PROGRAM_CONNECTION,
        payer,
        mintAddress,
        owner,
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
const mintAmountTo = async (payer: Keypair, toAccount: PublicKey, amount: BN, mintAddress: PublicKey = MINT_ADDRESS) => {
    if (IS_BANKRUN_ENABLED) {
        return await mintTo(context.banksClient, payer, MINT_ADDRESS, toAccount, MINT_AUTHORITY, amount);
    }
    // Mint supply
    await token.mintTo(
        PROGRAM_CONNECTION,
        payer,
        mintAddress,
        toAccount,
        MINT_AUTHORITY,
        amount,
    );
}

/**
 * Retrieves the balance of an Associated Token Account (ATA) in BN format.
 *
 * @async
 * @param {PublicKey} ataAddress - The address of the Associated Token Account to retrieve the balance for.
 * @returns {Promise<BN>} A promise that resolves to the balance of the ATA as a BN (Big Number) object.
 */
export const getAtaBalance = async (ataAddress: PublicKey): Promise<BN> => {
    if (IS_BANKRUN_ENABLED) {
        return new BN((await getAta(context.banksClient, ataAddress))?.amount);
    }
    const account = await token.getAccount(PROGRAM_CONNECTION, ataAddress);
    return new BN(account.amount);
}


export {
    MINT_ADDRESS,
    MINT_AUTHORITY,
    MINT_DECIMALS,
    initMint,
    getOrCreateATA,
    mintAmountTo,
    convertAmountToDecimals,
    convertFromDecimalsToAmount,
}