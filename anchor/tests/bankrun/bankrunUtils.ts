import { ACCOUNT_SIZE, AccountLayout, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, TransactionInstruction, Transaction, PublicKey, AccountInfo, clusterApiUrl, Connection } from "@solana/web3.js";
import { AddedAccount, BanksClient, BanksTransactionResultWithMeta, ProgramTestContext, startAnchor } from "solana-bankrun";
import { systemProgram } from "../config";
import { Befundr, BefundrIDL } from "../../src/befundr-exports";
import { setProvider, Program } from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import { USDC_MINT_ADDRESS } from "../token/token_config";
import { USDC_ACCOUNT } from "./usdcMintAccount";

export const IS_BANKRUN_ENABLED: boolean = process.env.BANKRUN_ENABLED == "true";
const INIT_BALANCE_LAMPORTS: number = 500_000_000_000;

export const initBankrun = async (): Promise<[ProgramTestContext, BankrunProvider, Program<Befundr>]> => {
    const usdcAccount: AddedAccount = { address: USDC_MINT_ADDRESS, info: USDC_ACCOUNT! };

    const context = await startAnchor("", [], [usdcAccount]);
    const provider = new BankrunProvider(context);
    setProvider(provider);
    const program = new Program<Befundr>(
        BefundrIDL as Befundr,
        provider,
    );
    return [context, provider, program];
}

export const createAndProcessTransaction = async (
    client: BanksClient,
    payer: Keypair,
    instruction: TransactionInstruction,
    additionalSigners: Keypair[] = []
): Promise<BanksTransactionResultWithMeta> => {
    const tx = new Transaction();
    const [latestBlockhash] = await client.getLatestBlockhash() ?? [];
    tx.recentBlockhash = latestBlockhash;
    tx.add(instruction);
    tx.feePayer = payer.publicKey;
    tx.sign(payer, ...additionalSigners);
    return await client.tryProcessTransaction(tx);
}

export const setupATA = (
    context: ProgramTestContext,
    usdcMint: PublicKey,
    owner: PublicKey,
    amount: number = 0
): PublicKey => {
    const tokenAccData = Buffer.alloc(ACCOUNT_SIZE);
    AccountLayout.encode(
        {
            mint: usdcMint,
            owner,
            amount: BigInt(amount),
            delegateOption: 0,
            delegate: PublicKey.default,
            delegatedAmount: BigInt(0),
            state: 1,
            isNativeOption: 0,
            isNative: BigInt(0),
            closeAuthorityOption: 0,
            closeAuthority: PublicKey.default,
        },
        tokenAccData,
    );

    const ata = getAssociatedTokenAddressSync(usdcMint, owner, true);
    const ataAccountInfo = {
        lamports: 1_000_000_000,
        data: tokenAccData,
        owner: TOKEN_PROGRAM_ID,
        executable: false,
    };

    context.setAccount(ata, ataAccountInfo);
    return ata;
}

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

