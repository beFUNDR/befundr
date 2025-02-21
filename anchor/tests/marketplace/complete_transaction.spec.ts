import { userData3 } from './../user/user_dataset';
import { program, PROGRAM_CONNECTION } from "../config";
import { completeTransaction, createContribution, createProject, createReward, createTransaction, createUser, createUserWalletWithSol } from "../utils";
import { userData1, userData2 } from "../user/user_dataset";
import { projectData1 } from "../project/project_dataset";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Account, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { convertAmountToDecimals, getAtaBalance, INITIAL_USER_ATA_BALANCE, InitMint, MintAmountTo } from "../token/token_config";
import { BN } from "@coral-xyz/anchor";
import { reward1 } from '../reward/reward_dataset';

describe('complete_transaction', () => {
    let creatorWallet: Keypair, sellerWallet: Keypair, buyerWallet: Keypair, creatorUserPdaKey: PublicKey, sellerUserPdaKey: PublicKey, buyerUserPdaKey: PublicKey, creatorWalletAta: Account, sellerWalletAta: Account, buyerWalletAta: Account, MINT_ADDRESS: PublicKey;

    beforeEach(async () => {
        creatorWallet = await createUserWalletWithSol();
        creatorUserPdaKey = await createUser(userData1, creatorWallet);
        sellerWallet = await createUserWalletWithSol();
        sellerUserPdaKey = await createUser(userData2, sellerWallet);
        buyerWallet = await createUserWalletWithSol();
        buyerUserPdaKey = await createUser(userData3, buyerWallet);
        ({ MINT_ADDRESS } = await InitMint());
        creatorWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            creatorWallet,
            MINT_ADDRESS,
            creatorWallet.publicKey
        );
        sellerWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            sellerWallet,
            MINT_ADDRESS,
            sellerWallet.publicKey
        );
        buyerWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            buyerWallet,
            MINT_ADDRESS,
            buyerWallet.publicKey
        );
        await MintAmountTo(creatorWallet, creatorWalletAta.address, INITIAL_USER_ATA_BALANCE);
        await MintAmountTo(sellerWallet, sellerWalletAta.address, INITIAL_USER_ATA_BALANCE);
        await MintAmountTo(buyerWallet, buyerWalletAta.address, INITIAL_USER_ATA_BALANCE);
    }, 10000);

    it("should successfully complete a buy transaction", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);
        const contributionPdaKey = await createContribution(
            projectPdaKey,
            sellerUserPdaKey,
            sellerWallet,
            projectContributionCounter,
            contributionAmount,
            new BN(0)
        );
        const sellingPrice = convertAmountToDecimals(200);
        const saleTransactionPdaKey = await createTransaction(projectPdaKey, contributionPdaKey, sellerUserPdaKey, sellerWallet, sellingPrice);
        const [sellerUserContributionsPdaKey] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_contributions"),
                sellerUserPdaKey.toBuffer(),
            ],
            program.programId
        );


        const expectedErrorRegex = new RegExp(`Account does not exist or has no data (?<address>${saleTransactionPdaKey.toString()})`);
        const saleTransactionPdaBefore = await program.account.saleTransaction.fetch(saleTransactionPdaKey);
        const contributionPdaBefore = await program.account.contribution.fetch(contributionPdaKey);
        const sellerUserContributionsPdaBefore = await program.account.userContributions.fetch(sellerUserContributionsPdaKey);
        const buyerAtaBalanceBefore = await getAtaBalance(buyerWalletAta.address);
        const sellerAtaBalanceBefore = await getAtaBalance(sellerWalletAta.address);

        await completeTransaction(projectPdaKey, contributionPdaKey, sellerUserPdaKey, buyerUserPdaKey, buyerWallet, sellerWallet.publicKey);


        const [buyerUserContributionsPdaKey] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_contributions"),
                buyerUserPdaKey.toBuffer(),
            ],
            program.programId
        );
        const contributionPdaAfter = await program.account.contribution.fetch(contributionPdaKey);
        const buyerAtaBalanceAfter = await getAtaBalance(buyerWalletAta.address);
        const sellerAtaBalanceAfter = await getAtaBalance(sellerWalletAta.address);
        const buyerUserContributionsPdaAfter = await program.account.userContributions.fetch(buyerUserContributionsPdaKey);

        await expect(program.account.saleTransaction.fetch(saleTransactionPdaKey)).rejects.toThrow(expectedErrorRegex);
        expect(saleTransactionPdaBefore.seller.toString()).toEqual(sellerUserPdaKey.toString());
        expect(contributionPdaBefore.currentOwner.toString()).toEqual(sellerUserPdaKey.toString());
        expect(contributionPdaAfter.currentOwner.toString()).toEqual(buyerUserPdaKey.toString());
        expect(buyerAtaBalanceAfter.toString()).toEqual((buyerAtaBalanceBefore.sub(sellingPrice)).toString());
        expect(sellerAtaBalanceAfter.toString()).toEqual((sellerAtaBalanceBefore.add(sellingPrice)).toString());
        expect(buyerAtaBalanceAfter.toString()).toEqual((buyerAtaBalanceBefore.sub(sellingPrice)).toString());
        expect(sellerAtaBalanceAfter.toString()).toEqual((sellerAtaBalanceBefore.add(sellingPrice)).toString());
        expect(sellerUserContributionsPdaBefore.contributions).toEqual(buyerUserContributionsPdaAfter.contributions);
    });
});
