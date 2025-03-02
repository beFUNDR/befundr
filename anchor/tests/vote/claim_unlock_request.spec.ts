import { program } from "../config";
import { claimUnlockRequest, createContribution, createProject, createReward, createUnlockRequest, createUser, createUserWalletWithSol } from "../utils/testUtils";
import { projectData2 } from "../project/project_dataset";
import { userData1, userData2 } from "../user/user_dataset";
import { convertAmountToDecimals, getAtaBalance, getOrCreateATA, INITIAL_USER_ATA_BALANCE, MINT_ADDRESS, mintAmountTo } from "../utils/tokenUtils";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { reward1 } from "../reward/reward_dataset";

//TODO rework tests once the project status moves from fundraising to realizing
describe.skip('claimUnlockRequest', () => {
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

    it("should successfully claim an unlock request", async () => {
        const { projectPdaKey } = await createProject(projectData2, 0, creatorUserPdaKey, creatorWallet);
        await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
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


        const [unlockRequestsPubkey] = PublicKey.findProgramAddressSync(
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
        const creatorAtaBalanceBefore = await getAtaBalance(creatorWallet.publicKey);
        // get update project ata balance
        const projectAtaBalanceBefore = await getAtaBalance(projectPdaKey);

        await claimUnlockRequest(projectPdaKey, creatorUserPdaKey, creatorWallet, unlockRequestPdaKey, 1);

        // get updated user wallet ata balance
        const creatorAtaBalance = await getAtaBalance(creatorWallet.publicKey);
        // get update project ata balance
        const projectAtaBalance = await getAtaBalance(projectPdaKey);

        expect(creatorAtaBalanceBefore.sub(expectedUnlockAmount).toString === creatorAtaBalance.toString())
        expect(projectAtaBalanceBefore.add(expectedUnlockAmount).toString === projectAtaBalance.toString())

    });
});