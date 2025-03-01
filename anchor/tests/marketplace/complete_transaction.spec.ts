import { userData3 } from './../user/user_dataset';
import { program } from "../config";
import { completeTransaction, createContribution, createProject, createReward, createTransaction, createUser, createUserWalletWithSol } from "../utils/testUtils";
import { userData1, userData2 } from "../user/user_dataset";
import { projectData1 } from "../project/project_dataset";
import { Keypair, PublicKey } from "@solana/web3.js";
import { convertAmountToDecimals, getAtaBalance, getOrCreateATA, INITIAL_USER_ATA_BALANCE, mintAmountTo, MINT_ADDRESS } from "../utils/tokenUtils";
import { BN } from "@coral-xyz/anchor";
import { reward1 } from '../reward/reward_dataset';
import { getAccountNotFoundErrorRegex } from '../utils/errorUtils';

describe('complete_transaction', () => {
    let creatorWallet: Keypair, sellerWallet: Keypair, buyerWallet: Keypair, creatorUserPdaKey: PublicKey, sellerUserPdaKey: PublicKey, buyerUserPdaKey: PublicKey, creatorWalletAta: PublicKey, sellerWalletAta: PublicKey, buyerWalletAta: PublicKey;

    beforeEach(async () => {
        creatorWallet = await createUserWalletWithSol();
        creatorUserPdaKey = await createUser(userData1, creatorWallet);
        sellerWallet = await createUserWalletWithSol();
        sellerUserPdaKey = await createUser(userData2, sellerWallet);
        buyerWallet = await createUserWalletWithSol();
        buyerUserPdaKey = await createUser(userData3, buyerWallet);
        creatorWalletAta = await getOrCreateATA(creatorWallet, creatorWallet.publicKey);
        sellerWalletAta = await getOrCreateATA(sellerWallet, sellerWallet.publicKey);
        buyerWalletAta = await getOrCreateATA(buyerWallet, buyerWallet.publicKey);
        await mintAmountTo(creatorWallet, creatorWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
        await mintAmountTo(sellerWallet, sellerWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
        await mintAmountTo(buyerWallet, buyerWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
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

        const expectedErrorRegex = getAccountNotFoundErrorRegex(saleTransactionPdaKey.toString());
        const saleTransactionPdaBefore = await program.account.saleTransaction.fetch(saleTransactionPdaKey);
        const contributionPdaBefore = await program.account.contribution.fetch(contributionPdaKey);
        const sellerUserContributionsPdaBefore = await program.account.userContributions.fetch(sellerUserContributionsPdaKey);
        const buyerAtaBalanceBefore = await getAtaBalance(buyerWalletAta);
        const sellerAtaBalanceBefore = await getAtaBalance(sellerWalletAta);

        await completeTransaction(projectPdaKey, contributionPdaKey, sellerUserPdaKey, buyerUserPdaKey, buyerWallet, sellerWallet.publicKey);


        const [buyerUserContributionsPdaKey] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_contributions"),
                buyerUserPdaKey.toBuffer(),
            ],
            program.programId
        );
        const contributionPdaAfter = await program.account.contribution.fetch(contributionPdaKey);
        const buyerAtaBalanceAfter = await getAtaBalance(buyerWalletAta);
        const sellerAtaBalanceAfter = await getAtaBalance(sellerWalletAta);
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
