import { program } from "../config";
import { createContribution, createProject, createReward, createUser, createUserWalletWithSol, startProject } from "../utils/testUtils";
import { projectData1 } from "./project_dataset";
import { userData1, userData2 } from "../user/user_dataset";
import { BN } from "@coral-xyz/anchor";
import { getAtaBalance, getOrCreateATA, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS, mintAmountTo } from "../utils/tokenUtils";
import { Enum, Keypair, PublicKey } from "@solana/web3.js";
import { reward1 } from "../reward/reward_dataset";
import { ProjectStatus } from "./project_status";

describe('startProject', () => {
    let creatorWallet: Keypair, creatorWalletAta: PublicKey, creatorUserPdaKey: PublicKey,
        userWallet: Keypair, userWalletAta: PublicKey, userPdaKey: PublicKey;

    beforeEach(async () => {
        creatorWallet = await createUserWalletWithSol();
        creatorUserPdaKey = await createUser(userData1, creatorWallet);
        creatorWalletAta = await getOrCreateATA(creatorWallet, creatorWallet.publicKey);
        await mintAmountTo(creatorWallet, creatorWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
        userWallet = await createUserWalletWithSol();
        userPdaKey = await createUser(userData2, userWallet);
        userWalletAta = await getOrCreateATA(userWallet, userWallet.publicKey);
        await mintAmountTo(userWallet, userWalletAta, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS);
    });

    it("should successfully move from fundraising to realizing status", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);

        const projectContributionCounter = projectPda.contributionCounter;

        const contributionAmount = projectData1.goalAmount;
        await createContribution(
            projectPdaKey,
            userPdaKey,
            userWallet,
            new BN(projectContributionCounter),
            contributionAmount,
            new BN(0),
        );

        const projectPdaBefore = await program.account.project.fetch(
            projectPdaKey
        );

        expect(new Enum(projectPdaBefore.status).enum).toBe(
            ProjectStatus.Fundraising.enum
        );

        await startProject(projectPdaKey, creatorWallet);

        const projectPdaAfter = await program.account.project.fetch(
            projectPdaKey
        );

        expect(new Enum(projectPdaAfter.status).enum).toBe(
            ProjectStatus.Realising.enum
        );

    });

    it("should fail as the raised amount is insufficient", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);

        const projectContributionCounter = projectPda.contributionCounter;

        const contributionAmount = projectData1.goalAmount.sub(new BN(1));
        await createContribution(
            projectPdaKey,
            userPdaKey,
            userWallet,
            new BN(projectContributionCounter),
            contributionAmount,
            new BN(0),
        );

        const projectPdaBefore = await program.account.project.fetch(
            projectPdaKey
        );

        expect(new Enum(projectPdaBefore.status).enum).toBe(
            ProjectStatus.Fundraising.enum
        );

        const expectedError = /.*Error Code: InsufficientRaisedAmount\. Error Number: 6001\. Error Message: The raised amount is lower than the goal amount\..*/;

        await expect(startProject(projectPdaKey, creatorWallet)).rejects.toThrow(expectedError);
    });

    it("should fail as the signer is not the project owner", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);

        const projectContributionCounter = projectPda.contributionCounter;

        const contributionAmount = projectData1.goalAmount;
        await createContribution(
            projectPdaKey,
            userPdaKey,
            userWallet,
            new BN(projectContributionCounter),
            contributionAmount,
            new BN(0),
        );

        const projectPdaBefore = await program.account.project.fetch(
            projectPdaKey
        );

        expect(new Enum(projectPdaBefore.status).enum).toBe(
            ProjectStatus.Fundraising.enum
        );

        const expectedError = /.*Error Code: WrongOwner. Error Number: 6000. Error Message: Invalid owner\..*/;

        await expect(startProject(projectPdaKey, userWallet)).rejects.toThrow(expectedError);
    });

    //Skipped as long as both the calls are performed in the same slot
    it.skip("should fail as the status is not fundraising", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);

        const projectContributionCounter = projectPda.contributionCounter;

        const contributionAmount = projectData1.goalAmount;
        await createContribution(
            projectPdaKey,
            userPdaKey,
            userWallet,
            new BN(projectContributionCounter),
            contributionAmount,
            new BN(0),
        );

        await startProject(projectPdaKey, creatorWallet);
        const expectedError = /.*Error Code: WrongStatus. Error Number: 6000. Error Message: The project is not in fundraising status\..*/;

        await expect(startProject(projectPdaKey, creatorWallet)).rejects.toThrow(expectedError);
    });
});