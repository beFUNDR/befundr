import { anchor, program, PROGRAM_CONNECTION } from "../config";
import { claimUnlockRequest, createContribution, createProject, createUnlockRequest, createUser, createUserWalletWithSol } from "../utils";
import { projectData2 } from "../project/project_dataset";
import { userData1, userData2 } from "../user/user_dataset";
import { convertAmountToDecimals, getTokenAccountBalance, INITIAL_USER_ATA_BALANCE, InitMint, MintAmountTo } from "../token/token_config";
import { Account, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

describe('claimUnlockRequest', () => {
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

    it("should successfully create an unlock request", async () => {
        const { projectPdaKey } = await createProject(projectData2, 0, creatorUserPdaKey, creatorWallet)
        const projectPda = await program.account.project.fetch(projectPdaKey);
        const projectContributionCounter = new BN(projectPda.contributionCounter);
        const contributionAmount = convertAmountToDecimals(100);
        const expectedUnlockAmount = convertAmountToDecimals(10);
        await createContribution(
            projectPdaKey,
            contributorPdaKey,
            contributorWallet,
            projectContributionCounter,
            contributionAmount,
            new BN(0)
        );


        const [unlockRequestsPubkey] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("project_unlock_requests"),
                projectPdaKey.toBuffer(),
            ],
            program.programId
        );
        const unlockRequests = await program.account.unlockRequests.fetch(unlockRequestsPubkey);


        const unlockRequestPdaKey = await createUnlockRequest(projectPdaKey, creatorUserPdaKey, creatorWallet, unlockRequests.requestCounter, expectedUnlockAmount);

        //const unlockRequest = await program.account.unlockRequest.fetch(unlockRequestPdaKey);

        // get updated user wallet ata balance
        const creatorAtaBalanceBefore = await getTokenAccountBalance(creatorWallet.publicKey);
        // get update project ata balance
        const projectAtaBalanceBefore = await getTokenAccountBalance(projectPdaKey, true);

        await claimUnlockRequest(projectPdaKey, creatorUserPdaKey, creatorWallet, unlockRequestPdaKey, 1);

        // get updated user wallet ata balance
        const creatorAtaBalance = await getTokenAccountBalance(creatorWallet.publicKey);
        // get update project ata balance
        const projectAtaBalance = await getTokenAccountBalance(projectPdaKey, true);

        expect(creatorAtaBalanceBefore.sub(expectedUnlockAmount).toString === creatorAtaBalance.toString())
        expect(projectAtaBalanceBefore.add(expectedUnlockAmount).toString === projectAtaBalance.toString())

    });
});