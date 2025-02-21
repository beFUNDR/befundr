import { reward1 } from './reward_dataset';
import { program, PROGRAM_CONNECTION } from "../config";
import { createProject, createReward, createUser, createUserWalletWithSol } from "../utils";
import { projectData1 } from "../project/project_dataset";
import { userData1, userData2 } from "../user/user_dataset";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, Account } from "@solana/spl-token"
import {
    InitMint,
    MINT_ADDRESS,
    MintAmountTo,
    INITIAL_USER_ATA_BALANCE,
} from "../token/token_config";

describe('createReward', () => {

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

    it("should successfully create a reward", async () => {
        const { projectPdaKey } = await createProject(projectData1, 0, creatorUserPdaKey, creatorWallet)

        const rewardPdaKey = await createReward(reward1, projectPdaKey, creatorUserPdaKey, creatorWallet);
        const rewardPda = await program.account.reward.fetch(rewardPdaKey);

        expect(rewardPda.currentSupply.toString()).toEqual(reward1.currentSupply.toString());
        expect((rewardPda.maxSupply || "").toString()).toEqual(reward1.maxSupply.toString());
        expect(rewardPda.price.toString()).toEqual(reward1.price.toString());
        expect(rewardPda.project.toString()).toEqual(projectPdaKey.toString());
    });
});
