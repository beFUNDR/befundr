import { program } from "../config";
import { createContribution, createProject, createReward, createUnlockRequest, createUser, createUserWalletWithSol } from "../utils/testUtils";
import { projectData2 } from "../project/project_dataset";
import { userData1, userData2 } from "../user/user_dataset";
import { UnlockStatus } from "./unlock_status";
import { convertAmountToDecimals, getOrCreateATA, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS, mintAmountTo } from "../utils/tokenUtils";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { reward1 } from "../reward/reward_dataset";

//TODO rework tests once the project status moves from fundraising to realizing
describe.skip('createUnlockRequest', () => {
    let creatorWallet: Keypair, contributorWallet: Keypair, creatorUserPdaKey: PublicKey, contributorPdaKey: PublicKey, creatorWalletAta: PublicKey, contributorWalletAta: PublicKey;

    beforeEach(async () => {
        creatorWallet = await createUserWalletWithSol();
        creatorUserPdaKey = await createUser(userData1, creatorWallet);
        contributorWallet = await createUserWalletWithSol();
        contributorPdaKey = await createUser(userData2, contributorWallet);
        creatorWalletAta = await getOrCreateATA(creatorWallet, creatorWallet.publicKey);
        contributorWalletAta = await getOrCreateATA(contributorWallet, contributorWallet.publicKey);
        await mintAmountTo(creatorWallet, creatorWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
        await mintAmountTo(creatorWallet, contributorWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
    }, 10000);
    it("should successfully create an unlock request", async () => {
        const { projectPdaKey } = await createProject(projectData2, 0, creatorUserPdaKey, creatorWallet)
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
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

    it("should reject as there is already one active", async () => {
        const { projectPdaKey } = await createProject(projectData2, 0, creatorUserPdaKey, creatorWallet);
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
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