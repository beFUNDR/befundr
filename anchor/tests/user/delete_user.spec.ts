import { Keypair, PublicKey } from "@solana/web3.js";
import { userData1, userData2, userData3 } from './user_dataset';
import { projectData1 } from "../project/project_dataset";
import { confirmTransaction, createUser, createUserWalletWithSol, createProject } from '../utils';
import { program, systemProgram, PROGRAM_CONNECTION } from '../config';
import * as bs58 from "bs58";
import { INITIAL_USER_ATA_BALANCE, InitMint, MintAmountTo } from "../token/token_config";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

// Generate admin keypair from secret key 
// FOR LOCAL TESTING PURPOSES ONLY
const adminKeypair = Keypair.fromSecretKey(
    bs58.decode(
        "tpXxTgtdHNPiXeU7cQ8WWkZdti9spg3GoXVCViFjdY5FXhDVwaGCFXvdDGbgCtSBrnQ5C1XW87qUYfa3m6iQyd9",
    ),
);

describe('deleteUser', () => {

    /**
    * Delete user function
    * @param userPda - The PDA of the user to delete
    * @param authorityWallet - The wallet of the authority to delete the user
    */
    const deleteUser = async (userPda: PublicKey, ownerWallet: PublicKey, authorityWallet: Keypair): Promise<void> => {
        // Implement the logic to delete the user
        const deleteUserTx = await program.methods
            .deleteUser()
            .accountsPartial({
                user: userPda,
                owner: ownerWallet,
                authority: authorityWallet.publicKey,
                systemProgram: systemProgram.programId,
            })
            .signers([authorityWallet])
            .rpc();
        await confirmTransaction(program, deleteUserTx);
    };

    it("should success to delete the user by admin", async () => {

        /* This test is to check : 
        * 1. if the user's owner lamports will be returned to the owner after the user pda is deleted
        * 2. if the user's pda is deleted
        */

        const userWallet = await createUserWalletWithSol();
        const userPda = await createUser(userData1, userWallet);
        const fetchUserAccount = await program.account.user.fetch(userPda);

        // Get the wallet info before deletion
        const fetchOwnerWalletBf = await program.provider.connection.getAccountInfo(fetchUserAccount.owner);

        // Deletion should success
        await deleteUser(userPda, fetchUserAccount.owner, adminKeypair);

        // Get the wallet info after deletion
        const fetchOwnerWalletAf = await program.provider.connection.getAccountInfo(fetchUserAccount.owner);

        // Check if lamports have been refund to owner
        expect(fetchOwnerWalletAf?.lamports).toBeGreaterThan(fetchOwnerWalletBf?.lamports ?? 0);

        const expectedError = /^Account does not exist or has no data.*/;
        await expect(program.account.user.fetch(userPda))
            .rejects
            .toThrow(expectedError);
    });

    it("should failed to delete the user by admin as the sol destination wallet is not the user account owner", async () => {

        const userWallet = await createUserWalletWithSol();
        const userWallet2 = await createUserWalletWithSol();
        const userPda = await createUser(userData1, userWallet);

        const expectedError = /^AnchorError thrown.*.Wrong owner account/;
        await expect(deleteUser(userPda, userWallet2.publicKey, adminKeypair))
            .rejects
            .toThrow(expectedError);
    });

    // Add the deleteUser function definition
    it("should fail to delete the user by user himself", async () => {

        const userWallet = await createUserWalletWithSol();
        const userPda = await createUser(userData1, userWallet);
        // Fetching to confirm user account exists
        const fetchUserAccount = await program.account.user.fetch(userPda);

        // Delete the user profile with the owner wallet
        const expectedError = /^AnchorError thrown.*.Unauthorized: Only the admin can delete users/;
        await expect(deleteUser(userPda, fetchUserAccount.owner, userWallet))
            .rejects
            .toThrow(expectedError);
    });

    it("should fail to delete the user by another user", async () => {

        const expectedError = /^AnchorError thrown.*.Unauthorized: Only the admin can delete users/;

        const userWallet = await createUserWalletWithSol();
        const userData = userData2;
        const userPda = await createUser(userData, userWallet);
        // Fetching to confirm user account exists
        const fetchUserAccount = await program.account.user.fetch(userPda);

        // Delete the user profile with another wallet
        const anotherWallet = await createUserWalletWithSol();
        await expect(deleteUser(userPda, fetchUserAccount.owner, anotherWallet))
            .rejects
            .toThrow(expectedError);
    });

    it("should fail to delete the user by admin if the user has created a project", async () => {

        const expectedError = /^AnchorError thrown.*.User has associated projects or contributions/;

        const userWallet = await createUserWalletWithSol();
        const { MINT_ADDRESS } = await InitMint();
        const userWalletAta = await getOrCreateAssociatedTokenAccount(
            PROGRAM_CONNECTION,
            userWallet,
            MINT_ADDRESS,
            userWallet.publicKey
        )
        await MintAmountTo(userWallet, userWalletAta.address, INITIAL_USER_ATA_BALANCE);
        const userPda = await createUser(userData1, userWallet);
        // Fetching to confirm user account exists
        const fetchUserAccount = await program.account.user.fetch(userPda);

        // Create a project for the user
        await createProject(projectData1, 0, userPda, userWallet);

        // Attempt to delete the user profile
        await expect(deleteUser(userPda, fetchUserAccount.owner, adminKeypair))
            .rejects
            .toThrow(expectedError);
    });
});
