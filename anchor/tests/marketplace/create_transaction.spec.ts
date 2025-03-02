import { program } from "../config";
import { createContribution, createProject, createReward, createTransaction, createUser, createUserWalletWithSol } from "../utils/testUtils";
import { userData1, userData2 } from "../user/user_dataset";

import { projectData1 } from "../project/project_dataset";
import { convertAmountToDecimals, getOrCreateATA, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS, mintAmountTo } from "../utils/tokenUtils";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { reward1 } from "../reward/reward_dataset";

describe('create_transaction', () => {
    let creatorWallet: Keypair, sellerWallet: Keypair, creatorUserPdaKey: PublicKey, sellerPdaKey: PublicKey, creatorWalletAta: PublicKey, sellerWalletAta: PublicKey;

    beforeEach(async () => {
        creatorWallet = await createUserWalletWithSol();
        creatorUserPdaKey = await createUser(userData1, creatorWallet);
        sellerWallet = await createUserWalletWithSol();
        sellerPdaKey = await createUser(userData2, sellerWallet);
        creatorWalletAta = await getOrCreateATA(creatorWallet, creatorWallet.publicKey);
        sellerWalletAta = await getOrCreateATA(sellerWallet, sellerWallet.publicKey);
        await mintAmountTo(creatorWallet, creatorWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
        await mintAmountTo(creatorWallet, sellerWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
    }, 10000);

    it("should successfully create a sell transaction", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);
        const contributionPdaKey = await createContribution(
            projectPdaKey,
            sellerPdaKey,
            sellerWallet,
            projectContributionCounter,
            contributionAmount,
            new BN(0)
        );
        const sellingPrice = convertAmountToDecimals(20);

        const saleTransactionPdaKey = await createTransaction(projectPdaKey, contributionPdaKey, sellerPdaKey, sellerWallet, sellingPrice);

        const saleTransactionPda = await program.account.saleTransaction.fetch(saleTransactionPdaKey);

        expect(saleTransactionPda.contribution.toString()).toEqual(contributionPdaKey.toString());
        expect(saleTransactionPda.contributionAmount.toString()).toEqual(contributionAmount.toString());
        expect(saleTransactionPda.seller.toString()).toEqual(sellerPdaKey.toString());
        expect(saleTransactionPda.sellingPrice.toString()).toEqual(sellingPrice.toString());
    });

    it("should throw an error if the contribution is already for sale", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet);
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);
        const contributionPdaKey = await createContribution(
            projectPdaKey,
            sellerPdaKey,
            sellerWallet,
            projectContributionCounter,
            contributionAmount,
            new BN(0)
        );
        const sellingPrice = convertAmountToDecimals(200);
        const secondSellingPrice = convertAmountToDecimals(40);

        const saleTransactionPdaKey = await createTransaction(projectPdaKey, contributionPdaKey, sellerPdaKey, sellerWallet, sellingPrice);

        const errorRegex = new RegExp(`Allocate: account Address { address: (?<address>${saleTransactionPdaKey.toString()}), base: None } already in use`);

        await expect(createTransaction(projectPdaKey, contributionPdaKey, sellerPdaKey, sellerWallet, secondSellingPrice)).rejects.toThrow(errorRegex);

        const saleTransactionPda = await program.account.saleTransaction.fetch(saleTransactionPdaKey);
        expect(saleTransactionPda.sellingPrice.toString()).toEqual(sellingPrice.toString());
    });

    it("should throw an error if the contribution has no associated reward", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);;
        const contributionPdaKey = await createContribution(
            projectPdaKey,
            sellerPdaKey,
            sellerWallet,
            projectContributionCounter,
            contributionAmount,
            null
        );
        const sellingPrice = convertAmountToDecimals(200);;
        const expectedError = /Error Code: NoReward\. Error Number: .*\. Error Message: No reward associated to this contribution.*/;

        await expect(createTransaction(projectPdaKey, contributionPdaKey, sellerPdaKey, sellerWallet, sellingPrice)).rejects.toThrow(expectedError);
    });

    it("should throw an error if the selling price is 0", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet);
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);
        const contributionPdaKey = await createContribution(
            projectPdaKey,
            sellerPdaKey,
            sellerWallet,
            projectContributionCounter,
            contributionAmount,
            new BN(0)
        );
        const sellingPrice = new BN(0);
        const expectedError = /Error Code: IncorrectSellingPrice\. Error Number: .*\. Error Message: Incorrect selling price.*/;

        await expect(createTransaction(projectPdaKey, contributionPdaKey, sellerPdaKey, sellerWallet, sellingPrice)).rejects.toThrow(expectedError);
    });

    it("should throw an error if the contribution reward has already been claimed", async () => {
    });

    it("should throw an error if the contribution has been cancelled", async () => {
    });
});