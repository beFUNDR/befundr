import { program, PROGRAM_CONNECTION } from "../config";
import { createProject, createUser, createUserWalletWithSol } from "../utils";
import { ONE_DAY_MILLISECONDS, projectData1 } from "./project_dataset";
import { userData1 } from "../user/user_dataset";
import { BN } from "@coral-xyz/anchor";
import { Account, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { convertAmountToDecimals, getAtaBalance, INITIAL_USER_ATA_BALANCE, InitMint, MintAmountTo } from "../token/token_config";
import { Keypair, PublicKey } from "@solana/web3.js";

describe('createProject', () => {
    let userWallet: Keypair, userWalletAta: Account, userPdaKey: PublicKey, MINT_ADDR: PublicKey;

    beforeEach(async () => {
        userWallet = await createUserWalletWithSol();
        userPdaKey = await createUser(userData1, userWallet);
        const { MINT_ADDRESS } = await InitMint();
        MINT_ADDR = MINT_ADDRESS;
        userWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            userWallet,
            MINT_ADDRESS,
            userWallet.publicKey
        )
        await MintAmountTo(userWallet, userWalletAta.address, INITIAL_USER_ATA_BALANCE);
    });

    it("should successfully create a project", async () => {
        const { projectPdaKey, projectAtaKey } = await createProject(projectData1, 0, userPdaKey, userWallet);
        const userWalletAtaBalanceAfter = await getAtaBalance(userWalletAta.address);
        const projectAtaBalanceAfter = await getAtaBalance(projectAtaKey);
        const projectPda = await program.account.project.fetch(projectPdaKey);

        expect(projectPda.metadataUri).toEqual(projectData1.metadataUri);
        expect(projectPda.owner).toEqual(userWallet.publicKey);
        expect(projectPda.user).toEqual(userPdaKey);
        expect(projectPda.endTime.toString()).toEqual(Math.floor(projectData1.endTime / 1000).toString());
        expect(projectPda.goalAmount.toString()).toEqual(projectData1.goalAmount.toString());
        expect(projectPda.safetyDeposit.toString()).toEqual(projectData1.safetyDeposit.toString());
        expect(userWalletAtaBalanceAfter.toString()).toEqual((INITIAL_USER_ATA_BALANCE - convertAmountToDecimals(50)).toString());
        expect(projectAtaBalanceAfter.toString()).toEqual(projectData1.safetyDeposit.toString());
    });

    it("should throw an error if the goal amount is too low", async () => {
        const expectedError = /Error Code: GoalAmountBelowLimit\. Error Number: .*\. Error Message: Goal amount is too low \(min \$1\).*/;
        const MIN_PROJECT_GOAL_AMOUNT = 0;
        const projectData = { ...projectData1, goalAmount: new BN(Math.max(0, MIN_PROJECT_GOAL_AMOUNT - 1)) };

        await expect(createProject(projectData, 0, userPdaKey, userWallet)).rejects
            .toThrow(expectedError);
    });

    it("should throw an error if the end time is in the past", async () => {
        const expectedError = /Error Code: EndTimeInPast\. Error Number: .*\. Error Message: End time is in the past.*/;
        const projectData = { ...projectData1, endTime: new BN(Date.now() - ONE_DAY_MILLISECONDS) };

        await expect(createProject(projectData, 0, userPdaKey, userWallet)).rejects
            .toThrow(expectedError);
    });

    it("should throw an error if the end time is too far in the future", async () => {
        const expectedError = /Error Code: ExceedingEndTime\. Error Number: .*\. Error Message: End time beyond the limit.*/;
        const MAX_PROJECT_CAMPAIGN_DURATION = ONE_DAY_MILLISECONDS * 90;
        const projectData = { ...projectData1, endTime: new BN(Date.now() + MAX_PROJECT_CAMPAIGN_DURATION * 2) };

        await expect(createProject(projectData, 0, userPdaKey, userWallet)).rejects
            .toThrow(expectedError);
    });
});