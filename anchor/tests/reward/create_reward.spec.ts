import { reward1 } from './reward_dataset';
import { program } from "../config";
import { createProject, createReward, createUser, createUserWalletWithSol } from "../utils/testUtils";
import { projectData1 } from "../project/project_dataset";
import { userData1, userData2 } from "../user/user_dataset";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
    mintAmountTo,
    INITIAL_USER_ATA_BALANCE,
    getOrCreateATA,
    MINT_ADDRESS,
} from "../utils/tokenUtils";

describe('createReward', () => {

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

    it("should successfully create a reward", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)

        const rewardPdaKey = await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const rewardPda = await program.account.reward.fetch(rewardPdaKey);

        expect(rewardPda.currentSupply.toString()).toEqual(reward1.currentSupply.toString());
        expect((rewardPda.maxSupply || "").toString()).toEqual((reward1.maxSupply || "").toString());
        expect(rewardPda.price.toString()).toEqual(reward1.price.toString());
        expect(rewardPda.project.toString()).toEqual(projectPdaKey.toString());
    });
});
