import { program, PROGRAM_CONNECTION } from "../config";
import { createContribution, createProject, createReward, createUser, createUserWalletWithSol } from "../utils";
import { projectData1 } from "../project/project_dataset";
import { userData1, userData2, userData3 } from "../user/user_dataset";
import { BN } from "@coral-xyz/anchor";
import { Enum, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, getAssociatedTokenAddress, getAccount, Account } from "@solana/spl-token"
import { ContributionStatus } from "./contribution_status";
import {
    InitMint,
    MINT_ADDRESS,
    MintAmountTo,
    convertAmountToDecimals,
    INITIAL_USER_ATA_BALANCE,
    getAtaBalance,
} from "../token/token_config";
import { reward1 } from "../reward/reward_dataset";

describe('createContribution', () => {

    let creatorWallet: Keypair, creatorWalletAta: Account, creatorUserPdaKey: PublicKey,
        userWallet: Keypair, userWalletAta: Account, userPdaKey: PublicKey;

    beforeEach(async () => {
        await InitMint();

        creatorWallet = await createUserWalletWithSol();
        creatorUserPdaKey = await createUser(userData1, creatorWallet);
        creatorWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            creatorWallet,
            MINT_ADDRESS,
            creatorWallet.publicKey
        );
        await MintAmountTo(creatorWallet, creatorWalletAta.address, INITIAL_USER_ATA_BALANCE);

        userWallet = await createUserWalletWithSol();
        userPdaKey = await createUser(userData2, userWallet);
        userWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            userWallet,
            MINT_ADDRESS,
            userWallet.publicKey
        );
        await MintAmountTo(userWallet, userWalletAta.address, INITIAL_USER_ATA_BALANCE);
    });

    it("should successfully create a contribution with reward 1", async () => {

        const INITIAL_PAID_AMOUNT = 100;

        // Prepare Project context
        const { projectPdaKey, projectAtaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        const rewardPdaKey = await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectAtaBalanceBefore = await getAtaBalance(projectAtaKey);

        const projectContributionCounter = projectPda.contributionCounter;

        // Create a contribution
        const contributionAmount = convertAmountToDecimals(INITIAL_PAID_AMOUNT);
        const contributionPdaKey = await createContribution(
            projectPdaKey,
            userPdaKey,
            userWallet,
            new BN(projectContributionCounter),
            contributionAmount,
            new BN(0),
        );

        const contributionPda = await program.account.contribution.fetch(
            contributionPdaKey
        );
        const projectPdaUpdated = await program.account.project.fetch(
            projectPdaKey
        );
        // get updated user wallet ata balance
        const userWalletAtaAccount = await getAccount(
            PROGRAM_CONNECTION,
            userWalletAta.address
        );
        // get update project ata balance
        const projectAtaAccount = await getAccount(
            PROGRAM_CONNECTION,
            projectAtaKey
        );

        expect(new BN(userWalletAtaAccount.amount).toString())
            .toEqual((INITIAL_USER_ATA_BALANCE - convertAmountToDecimals(INITIAL_PAID_AMOUNT)).toString());
        expect(new BN(projectAtaAccount.amount).toString())
            .toEqual(projectAtaBalanceBefore.add(convertAmountToDecimals(INITIAL_PAID_AMOUNT)).toString());

        expect(contributionPda.initialOwner).toEqual(userPdaKey);
        expect(contributionPda.currentOwner).toEqual(userPdaKey);
        expect(contributionPda.project).toEqual(projectPdaKey);
        expect(contributionPda.amount.toString()).toEqual(
            contributionAmount.toString()
        );
        expect((contributionPda.reward || "").toString()).toEqual(rewardPdaKey.toString());
        expect(contributionPda.creationTimestamp.toNumber()).toBeGreaterThan(0);
        expect(contributionPda.isClaimed).toBeFalsy();
        expect(new Enum(contributionPda.status).enum).toBe(
            ContributionStatus.Active.enum
        );

        expect(projectPdaUpdated.raisedAmount.toString()).toEqual(contributionAmount.toString());
        expect(projectPdaUpdated.contributionCounter).toEqual(projectContributionCounter + 1)
    },
        20000);

    it.skip('should fail if the project is not in fundraising state', async () => {
        // no project state updates instruction exist at this time
    });

    it.skip('should fail if the project is not in fundraising period', async () => {
        // unable to create a past project
    });

    it('should fail if the signer is not the actual user PDA owner', async () => {

        // Prepare Project context
        const { projectPdaKey, projectAtaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        const rewardPdaKey = await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = projectPda.contributionCounter;

        // Create a different wallet to simulate the wrong signer
        const wrongWallet = await createUserWalletWithSol();
        const wrongWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            wrongWallet,
            MINT_ADDRESS,
            wrongWallet.publicKey
        );
        await MintAmountTo(wrongWallet, wrongWalletAta.address, INITIAL_USER_ATA_BALANCE);

        const expectedErrorMessage = new RegExp('Signer must be the user.');

        // Create a contribution
        const contributionAmount = convertAmountToDecimals(5);
        await expect(
            createContribution(
                projectPdaKey,
                userPdaKey,
                wrongWallet,
                new BN(projectContributionCounter),
                contributionAmount,
                new BN(0),
            )
        ).rejects.toThrow(expectedErrorMessage);
    });

    it('should fail if the contribution amount is negative or equal to 0', async () => {

        const INITIAL_PAID_AMOUNT = 0;
        const expectedErrorMessage = new RegExp('Contribution amount is insufficient for the selected reward.');

        // Prepare Project context
        const { projectPdaKey, projectAtaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        const rewardPdaKey = await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);

        const projectContributionCounter = projectPda.contributionCounter;

        // Create a contribution
        const contributionAmount = convertAmountToDecimals(INITIAL_PAID_AMOUNT);
        await expect(
            createContribution(
                projectPdaKey,
                userPdaKey,
                userWallet,
                new BN(projectContributionCounter),
                contributionAmount,
                new BN(0),
            )
        ).rejects.toThrow(expectedErrorMessage);
    });

    it('should fail if the contribution amount is insufficient for the selected reward', async () => {
        const INITIAL_PAID_AMOUNT = 5;
        const expectedErrorMessage = new RegExp('Contribution amount is insufficient for the selected reward.');

        // Prepare Project context
        const { projectPdaKey, projectAtaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet);
        const rewardPdaKey = await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);

        const projectContributionCounter = projectPda.contributionCounter;

        // Attempt to create a contribution after the limit is reached
        const contributionAmount = convertAmountToDecimals(INITIAL_PAID_AMOUNT);
        await expect(
            createContribution(
                projectPdaKey,
                userPdaKey,
                userWallet,
                new BN(projectContributionCounter),
                contributionAmount,
                new BN(0),
            )
        ).rejects.toThrow(expectedErrorMessage);
    });

    it('should fail if the reward supply has reached its maximum limit', async () => {
        const INITIAL_PAID_AMOUNT = 400;
        const expectedErrorMessage = new RegExp('Reward supply has reached its maximum limit.');

        // Prepare Project context
        const { projectPdaKey, projectAtaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet);
        const rewardPdaKey = await createReward({ ...reward1, maxSupply: new BN(1) }, projectPdaKey, creatorUserPdaKey, creatorWallet);
        let projectPda = await program.account.project.fetch(projectPdaKey);
        let projectContributionCounter = projectPda.contributionCounter;

        const contributionAmount = convertAmountToDecimals(INITIAL_PAID_AMOUNT);

        // First contribution
        const contributionPdaKey = await createContribution(
            projectPdaKey,
            userPdaKey,
            userWallet,
            new BN(projectContributionCounter),
            contributionAmount,
            new BN(0),
        );

        // Attempt to create a contribution after the limit is reached
        const anotherWallet = await createUserWalletWithSol();
        const anotherUserPda = await createUser(userData3, anotherWallet);
        const anotherWalletAta = await getAssociatedTokenAddress(MINT_ADDRESS, anotherWallet.publicKey);
        await MintAmountTo(anotherWallet, anotherWalletAta, INITIAL_USER_ATA_BALANCE);

        projectPda = await program.account.project.fetch(projectPdaKey);
        projectContributionCounter = projectPda.contributionCounter;

        await expect(
            createContribution(
                projectPdaKey,
                anotherUserPda,
                anotherWallet,
                new BN(projectContributionCounter),
                contributionAmount,
                new BN(0),
            )
        ).rejects.toThrow(expectedErrorMessage);
    });

    it('should update the User and Project contributions list', async () => {
        const INITIAL_PAID_AMOUNT = 100;
        const rewardCounter = 0;

        // Prepare Project context
        const { projectPdaKey, projectAtaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)
        const rewardPdaKey = await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const projectPda = await program.account.project.fetch(projectPdaKey);

        const projectContributionCounter = projectPda.contributionCounter;

        // Create a contribution
        const contributionAmount = convertAmountToDecimals(INITIAL_PAID_AMOUNT);
        const contributionPdaKey = await createContribution(
            projectPdaKey,
            userPdaKey,
            userWallet,
            new BN(projectContributionCounter),
            contributionAmount,
            new BN(rewardCounter),
        );

        // Get projectContributions PDA Pubkey
        const [projectContributionsPubkey] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("project_contributions"),
                projectPdaKey.toBuffer(),
            ],
            program.programId
        );
        // Get userContributions PDA Pubkey
        const [userContributionsPubkey] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_contributions"),
                userPdaKey.toBuffer(),
            ],
            program.programId
        );

        const projectContributions = await program.account.projectContributions.fetch(projectContributionsPubkey);
        const userContributions = await program.account.userContributions.fetch(userContributionsPubkey);

        expect(projectContributions.contributions).toContainEqual(contributionPdaKey);
        expect(userContributions.contributions).toContainEqual(contributionPdaKey);

    });
});
