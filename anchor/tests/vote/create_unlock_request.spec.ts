import { program, PROGRAM_CONNECTION } from "../config";
import { createContribution, createProject, createReward, createUnlockRequest, createUser, createUserWalletWithSol } from "../utils";
import { projectData2 } from "../project/project_dataset";
import { userData1, userData2 } from "../user/user_dataset";
import { UnlockStatus } from "./unlock_status";
import { convertAmountToDecimals, INITIAL_USER_ATA_BALANCE, InitMint, MintAmountTo } from "../token/token_config";
import { Account, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { reward1 } from "../reward/reward_dataset";

describe('createUnlockRequest', () => {
    let creatorWallet: Keypair, contributorWallet: Keypair, creatorUserPdaKey: PublicKey, contributorPdaKey: PublicKey, creatorWalletAta: Account, contributorWalletAta: Account, MINT_ADDR: PublicKey;

    beforeEach(async () => {
        creatorWallet = await createUserWalletWithSol();
        creatorUserPdaKey = await createUser(userData1, creatorWallet);
        contributorWallet = await createUserWalletWithSol();
        contributorPdaKey = await createUser(userData2, contributorWallet);
        const { MINT_ADDRESS } = await InitMint();
        MINT_ADDR = MINT_ADDRESS;
        creatorWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            creatorWallet,
            MINT_ADDRESS,
            creatorWallet.publicKey
        );
        contributorWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            contributorWallet,
            MINT_ADDRESS,
            contributorWallet.publicKey
        );
        await MintAmountTo(creatorWallet, creatorWalletAta.address, INITIAL_USER_ATA_BALANCE);
        await MintAmountTo(creatorWallet, contributorWalletAta.address, INITIAL_USER_ATA_BALANCE);
    }, 10000);
    it.skip("should successfully create an unlock request", async () => {
        const { projectPdaKey } = await createProject(projectData2, 0, creatorUserPdaKey, creatorWallet)
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);
        const expectedUnlockAmount = convertAmountToDecimals(10);
        const expectedCounterBefore = 0;
        const expectedCounterAfter = 1;
        await createContribution(
            projectPdaKey,
            contributorPdaKey,
            contributorWallet,
            projectContributionCounter,
            contributionAmount,
            new BN(0)
        );
        const [unlockRequestsPubkey] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("project_unlock_requests"),
                projectPdaKey.toBuffer(),
            ],
            program.programId
        );
        const unlockRequests = await program.account.unlockRequests.fetch(unlockRequestsPubkey);
        expect(unlockRequests.requestCounter).toEqual(expectedCounterBefore);

        const unlockRequestPdaKey = await createUnlockRequest(projectPdaKey, creatorUserPdaKey, creatorWallet, unlockRequests.requestCounter, expectedUnlockAmount);

        const unlockRequest = await program.account.unlockRequest.fetch(unlockRequestPdaKey);

        expect(unlockRequest.project).toEqual(projectPdaKey);
        expect(unlockRequest.amountRequested.toNumber()).toEqual(expectedUnlockAmount);
        expect(unlockRequest.votesAgainst.toNumber()).toEqual(0);
        //expect(unlockRequest.createdTime.toNumber()).toEqual(expectedUnlockAmount);
        //expect(unlockRequest.endTime.toNumber()).toEqual(expectedUnlockAmount);
        //expect(unlockRequest.unlockTime.toNumber()).toEqual(expectedUnlockAmount);
        expect(new UnlockStatus(unlockRequest.status).enum).toEqual(UnlockStatus.Approved.enum);

        const unlockRequestsAfter = await program.account.unlockRequests.fetch(unlockRequestsPubkey);
        expect(unlockRequestsAfter.requestCounter).toEqual(expectedCounterAfter);

    });

    it.skip("should reject as there is already one active", async () => {
        const { projectPdaKey } = await createProject(projectData2, 0, creatorUserPdaKey, creatorWallet)
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);
        const expectedUnlockAmount = convertAmountToDecimals(10);
        const expectedError = /Error Code: UnlockVoteAlreadyOngoing\. Error Number: .*\. Error Message: There is already a vote ongoing.*/;

        await createContribution(
            projectPdaKey,
            contributorPdaKey,
            contributorWallet,
            projectContributionCounter,
            contributionAmount,
            new BN(0)
        );

        const [unlockRequestsPubkey] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("project_unlock_requests"),
                projectPdaKey.toBuffer(),
            ],
            program.programId
        );

        const unlockRequests = await program.account.unlockRequests.fetch(unlockRequestsPubkey);

        await createUnlockRequest(projectPdaKey, creatorUserPdaKey, creatorWallet, unlockRequests.requestCounter, expectedUnlockAmount);

        const freshUnlockRequests = await program.account.unlockRequests.fetch(unlockRequestsPubkey);
        await expect(createUnlockRequest(projectPdaKey, creatorUserPdaKey, creatorWallet, freshUnlockRequests.requestCounter, expectedUnlockAmount)).rejects.toThrow(expectedError);
    });

    it("should reject as the project status is not Realising", async () => {
        const { projectPdaKey } = await createProject(projectData2, 0, creatorUserPdaKey, creatorWallet)
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);
        const expectedUnlockAmount = convertAmountToDecimals(10);
        const expectedError = /Error Code: WrongProjectStatus\. Error Number: .*\. Error Message: The project is not in realization.*/;

        await createContribution(
            projectPdaKey,
            contributorPdaKey,
            contributorWallet,
            projectContributionCounter,
            contributionAmount,
            new BN(0),);

        const [unlockRequestsPubkey] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("project_unlock_requests"),
                projectPdaKey.toBuffer(),
            ],
            program.programId
        );

        const unlockRequests = await program.account.unlockRequests.fetch(unlockRequestsPubkey);

        await expect(createUnlockRequest(projectPdaKey, creatorUserPdaKey, creatorWallet, unlockRequests.requestCounter, expectedUnlockAmount)).rejects.toThrow(expectedError);
    });
});