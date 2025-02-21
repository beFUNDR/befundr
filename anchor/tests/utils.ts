import { BlockheightBasedTransactionConfirmationStrategy, RpcResponseAndContext, SignatureResult, TransactionSignature, LAMPORTS_PER_SOL, Keypair, PublicKey } from "@solana/web3.js";
import { Befundr } from "../src";
import { User } from "./user/user_type";
import { context, program, systemProgram } from "./config";
import { BN, Program } from "@coral-xyz/anchor";
import { Project } from "./project/project_type";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
    MINT_ADDRESS,
    newAssociatedTokenAccount,
    newPdaAssociatedTokenAccount
} from "./token/token_config";
import { createAccount, IS_BANKRUN_ENABLED } from "./bankrun/bankrunUtils";
import { Reward } from './reward/reward_type';

export const LAMPORTS_INIT_BALANCE = 1000 * LAMPORTS_PER_SOL; // 1000 SOL per wallet

export const confirmTransaction = async (program: Program<Befundr>, tx: TransactionSignature): Promise<RpcResponseAndContext<SignatureResult> | void> => {
    if (IS_BANKRUN_ENABLED) {
        //No need to confirm transactions when using Bankrun
        return Promise.resolve();
    }
    const latestBlockhash = await program.provider.connection.getLatestBlockhash();
    const confirmationStrategy: BlockheightBasedTransactionConfirmationStrategy = { ...latestBlockhash, signature: tx };

    return await program.provider.connection.confirmTransaction(confirmationStrategy, "confirmed");
}

/**
 * **************************************
 *             PDA CRUD UTILS
 * **************************************
 */

/**
 * Create wallet
 * It will contain some SOL
 * @returns 
 */
export const createUserWalletWithSol = async (): Promise<Keypair> => {
    if (IS_BANKRUN_ENABLED) {
        return Promise.resolve(createAccount(context));
    }
    const wallet = new Keypair()
    const tx = await program.provider.connection.requestAirdrop(wallet.publicKey, LAMPORTS_INIT_BALANCE);
    await confirmTransaction(program, tx);
    return wallet
}

/**
 * Create User PDA
 * @param userData 
 * @param wallet 
 * @returns 
 */
export const createUser = async (userData: User, wallet: Keypair): Promise<PublicKey> => {
    const [userPdaPublicKey] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
    );

    // Call the createUser method
    const createUserTx = await program.methods
        .createUser()
        .accountsPartial({
            signer: wallet.publicKey,
            user: userPdaPublicKey,
            systemProgram: systemProgram.programId,
        })
        .signers([wallet])
        .rpc();
    await confirmTransaction(program, createUserTx);

    // Create user Wallet's ATA
    await newAssociatedTokenAccount(wallet);

    return userPdaPublicKey;
}

export const getProjectPdaKey = (userPdaKey: PublicKey, userProjectCounter: BN) => {
    // Seeds building
    const seeds = [
        Buffer.from("project"),
        userPdaKey.toBuffer(),
        new BN(userProjectCounter + 1).toArray('le', 2),
    ];

    // Project Pda address research with seeds
    const [projectPdaPublicKey] = PublicKey.findProgramAddressSync(
        seeds,
        program.programId
    );

    return projectPdaPublicKey;

}

// Create a new project
export const createProject = async (
    projectData: Project,
    userProjectCounter: number,
    userPubkey: PublicKey,
    wallet: Keypair
): Promise<{ projectPdaKey: PublicKey, projectAtaKey: PublicKey }> => {

    const projectPdaKey = getProjectPdaKey(userPubkey, userProjectCounter);

    // Get projectContributions PDA Pubkey
    const [projectContributionsPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("project_contributions"),
            projectPdaKey.toBuffer(),
        ],
        program.programId
    );

    const [rewardsPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("rewards"), projectPdaKey.toBuffer()],
        program.programId
    );

    const userWalletAtaPubkey: PublicKey = getAssociatedTokenAddressSync(MINT_ADDRESS, wallet.publicKey, false);
    const projectAtaKey = await newPdaAssociatedTokenAccount(wallet, projectPdaKey);

    // Call the createProject method
    const createTx = await program.methods
        .createProject(
            projectData.metadataUri,
            projectData.goalAmount,
            new BN(Math.floor(projectData.endTime / 1000)),
            projectData.safetyDeposit,
        )
        .accountsPartial({
            rewards: rewardsPubkey,
            user: userPubkey,
            project: projectPdaKey,
            fromAta: userWalletAtaPubkey,
            toAta: projectAtaKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            signer: wallet.publicKey,
        })
        .signers([wallet])
        .rpc();

    await confirmTransaction(program, createTx);

    return { projectPdaKey, projectAtaKey };
}

export const createReward = async (reward: Reward, projectPubkey: PublicKey,
    userPubkey: PublicKey,
    wallet: Keypair): Promise<PublicKey> => {

    const [rewardsPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("rewards"), projectPubkey.toBuffer()],
        program.programId
    );

    const rewardsPda = await program.account.rewards.fetch(rewardsPubkey);
    const [rewardPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("reward"),
        projectPubkey.toBuffer(),
        new BN(rewardsPda.rewardCounter).add(new BN(1)).toArray('le', 2),
        ],
        program.programId
    );

    // Call the createUser method
    const createRewardTx = await program.methods
        .createReward(
            reward.metadataUri,
            reward.maxSupply,
            reward.price
        )
        .accountsPartial({
            project: projectPubkey,
            reward: rewardPubkey,
            rewards: rewardsPubkey,
            owner: wallet.publicKey,
            user: userPubkey,
            systemProgram: systemProgram.programId,
        })
        .signers([wallet])
        .rpc();

    await confirmTransaction(program, createRewardTx);

    return rewardPubkey;
}

/**
 * Create a new contribution
 * @param projectPubkey 
 * @param userPubkey 
 * @param wallet
 * @param projectContributionCounter
 * @param amount 
 * @param rewardCounter 
 * @returns 
 */
export const createContribution = async (
    projectPubkey: PublicKey,
    userPubkey: PublicKey,
    wallet: Keypair,
    projectContributionCounter: BN,
    amount: BN,
    rewardCounter: BN | null,
): Promise<PublicKey> => {

    const [contributionPdaPublicKey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("contribution"),
            projectPubkey.toBuffer(),
            projectContributionCounter.add(new BN(1)).toArray('le', 2),
        ],
        program.programId
    );

    let rewardPdaKey: PublicKey | null = null;

    if (rewardCounter !== null) {
        const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("reward"),
                projectPubkey.toBuffer(),
                rewardCounter.add(new BN(1)).toArray('le', 2),
            ],
            program.programId
        );
        rewardPdaKey = pda;
    }
    // Get projectContributions PDA Pubkey
    const [projectContributionsPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("project_contributions"),
            projectPubkey.toBuffer(),
        ],
        program.programId
    );
    // Get userContributions PDA Pubkey
    const [userContributionsPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_contributions"),
            userPubkey.toBuffer(),
        ],
        program.programId
    );

    // Get SPL Token transfer accounts
    const fromAta = await getAssociatedTokenAddress(MINT_ADDRESS, wallet.publicKey);
    const toAta = await getAssociatedTokenAddress(MINT_ADDRESS, projectPubkey, true);

    // Call the addContribution method
    const createTx = await program.methods
        .addContribution(amount)
        .accountsPartial({
            project: projectPubkey,
            projectContributions: projectContributionsPubkey,
            reward: rewardPdaKey,
            user: userPubkey,
            userContributions: userContributionsPubkey,
            contribution: contributionPdaPublicKey,
            fromAta: fromAta,
            toAta: toAta,
            signer: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([wallet])
        .rpc();

    await confirmTransaction(program, createTx);

    return contributionPdaPublicKey;
}

export const createUnlockRequest = async (
    projectPubkey: PublicKey,
    userPubkey: PublicKey,
    wallet: Keypair,
    unlockRequestsCounter: number,
    amountRequested: number
): Promise<PublicKey> => {
    const [unlockRequestsPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("project_unlock_requests"),
            projectPubkey.toBuffer(),
        ],
        program.programId
    );
    const [newUnlockRequestPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("unlock_request"),
            projectPubkey.toBuffer(),
            new BN(unlockRequestsCounter + 1).toArray('le', 2),
        ],
        program.programId
    );

    const [currentUnlockRequestPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("unlock_request"),
            projectPubkey.toBuffer(),
            new BN(unlockRequestsCounter).toArray('le', 2),
        ],
        program.programId
    );


    const createTx = await program.methods
        .createUnlockRequest(
            new BN(amountRequested)
        )
        .accountsPartial({
            user: userPubkey,
            unlockRequests: unlockRequestsPubkey,
            newUnlockRequest: newUnlockRequestPubkey,
            currentUnlockRequest: unlockRequestsCounter && currentUnlockRequestPubkey || null, //null account if no requests yet
            project: projectPubkey,
            owner: wallet.publicKey,
        })
        .signers([wallet])
        .rpc();

    await confirmTransaction(program, createTx);

    return newUnlockRequestPubkey;
}

export const claimUnlockRequest = async (
    projectPubkey: PublicKey,
    userPubkey: PublicKey,
    wallet: Keypair,
    unlockRequestPubkey: PublicKey,
    createdProjectCounter: number
): Promise<void> => {
    const [unlockRequestsPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("project_unlock_requests"),
            projectPubkey.toBuffer(),
        ],
        program.programId
    );

    // Get SPL Token transfer accounts
    const fromAta = await getAssociatedTokenAddress(MINT_ADDRESS, projectPubkey, true);
    const toAta = await getAssociatedTokenAddress(MINT_ADDRESS, wallet.publicKey, true);
    const claimTx = await program.methods
        .claimUnlockRequest(createdProjectCounter)
        .accountsPartial({
            user: userPubkey,
            unlockRequests: unlockRequestsPubkey,
            currentUnlockRequest: unlockRequestPubkey,
            fromAta,
            toAta,
            project: projectPubkey,
            owner: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID
        })
        .signers([wallet])
        .rpc();

    await confirmTransaction(program, claimTx);
}

export const createTransaction = async (
    projectPdaKey: PublicKey,
    contributionPubkey: PublicKey,
    userPubkey: PublicKey,
    sellerWallet: Keypair,
    sellingPrice: number
): Promise<PublicKey> => {

    const [saleTransactionPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("sale_transaction"),
            contributionPubkey.toBuffer(),
        ],
        program.programId
    );

    const [projectSaleTransactionsPdaKey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("project_sale_transactions"),
            projectPdaKey.toBuffer(),
        ],
        program.programId
    );

    const createTx = await program.methods
        .createTransaction(
            new BN(sellingPrice)
        )
        .accountsPartial({
            projectSaleTransactions: projectSaleTransactionsPdaKey,
            saleTransaction: saleTransactionPubkey,
            user: userPubkey,
            contribution: contributionPubkey,
            owner: sellerWallet.publicKey,
        })
        .signers([sellerWallet])
        .rpc();

    await confirmTransaction(program, createTx);

    return saleTransactionPubkey;
}

export const completeTransaction = async (
    projectPdaKey: PublicKey,
    contributionPdaKey: PublicKey,
    sellerUserPdaKey: PublicKey,
    buyerUserPdaKey: PublicKey,
    buyerWallet: Keypair,
    sellerPubkey: PublicKey,
): Promise<PublicKey> => {

    const [historyTransactionsPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("history_transactions"),
            contributionPdaKey.toBuffer(),
        ],
        program.programId
    );

    const [saleTransactionPubkey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("sale_transaction"),
            contributionPdaKey.toBuffer(),
        ],
        program.programId
    );

    const [buyerContributionsPdaKey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_contributions"),
            buyerUserPdaKey.toBuffer(),
        ],
        program.programId
    );

    const [sellerContributionsPdaKey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_contributions"),
            sellerUserPdaKey.toBuffer(),
        ],
        program.programId
    );

    const [projectSaleTransactionsPdaKey] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("project_sale_transactions"),
            projectPdaKey.toBuffer(),
        ],
        program.programId
    );

    // Get SPL Token transfer accounts
    const buyerAtaKey = await getAssociatedTokenAddress(MINT_ADDRESS, buyerWallet.publicKey);
    const sellerAtaKey = await getAssociatedTokenAddress(MINT_ADDRESS, sellerPubkey, true);

    const createTx = await program.methods
        .completeTransaction()
        .accountsPartial({
            projectSaleTransactions: projectSaleTransactionsPdaKey,
            historyTransactions: historyTransactionsPubkey,
            saleTransaction: saleTransactionPubkey,
            buyerUserContributions: buyerContributionsPdaKey,
            sellerUserContributions: sellerContributionsPdaKey,
            buyerUser: buyerUserPdaKey,
            sellerUser: sellerUserPdaKey,
            contribution: contributionPdaKey,
            buyer: buyerWallet.publicKey,
            buyerAta: buyerAtaKey,
            seller: sellerPubkey,
            sellerAta: sellerAtaKey,
            tokenProgram: TOKEN_PROGRAM_ID
        })
        .signers([buyerWallet])
        .rpc();

    await confirmTransaction(program, createTx);

    return saleTransactionPubkey;
}