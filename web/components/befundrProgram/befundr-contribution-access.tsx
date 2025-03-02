/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PublicKey } from '@solana/web3.js';
import { useBefundrProgramGlobal } from './befundr-global-access';
import { BN } from '@coral-xyz/anchor';
import { getATA } from '@/utils/functions/AtaFunctions';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { confirmTransaction } from '@/utils/functions/utilFunctions';

//* TYPE
interface AddContributionArgs {
  projectPubkey: PublicKey;
  userPubkey: PublicKey;
  userWalletPubkey: PublicKey;
  projectContributionCounter: number;
  amount: number;
  reward?: PublicKey;
}

export function useBefundrProgramContribution() {
  const { program, programId, transactionToast, router, connection } =
    useBefundrProgramGlobal();

  //* QUERIES
  //* Fetch all contributions --------------------
  const allContributionsAccounts = useQuery({
    queryKey: ['contribution', 'all'],
    queryFn: () => program.account.contribution.all(),
    staleTime: 60000,
  });

  //* Fetch user contributions PDA --------------
  const getUserContributionsPda = (
    userPdaPublicKey: PublicKey | null | undefined
  ) => {
    return useQuery({
      queryKey: ['userContributionsPda', userPdaPublicKey?.toString()],
      queryFn: async () => {
        if (!userPdaPublicKey) throw new Error('PublicKey is required');
        const [contributionsPdaKey] = await PublicKey.findProgramAddress(
          [Buffer.from('user_contributions'), userPdaPublicKey.toBuffer()],
          programId
        );
        return program.account.userContributions.fetch(contributionsPdaKey);
      },
      staleTime: 6000,
    });
  };

  //* Fetch all user contributions --------------
  const getAllUserContributions = (
    userPdaPublicKey: PublicKey | null | undefined
  ) => {
    return useQuery({
      queryKey: ['allUserContributions', userPdaPublicKey?.toString()],
      queryFn: async () => {
        if (!userPdaPublicKey) throw new Error('PublicKey is required');
        // get the userContributions Pda
        const [contributionsPdaKey] = await PublicKey.findProgramAddress(
          [Buffer.from('user_contributions'), userPdaPublicKey.toBuffer()],
          programId
        );
        const userContributionsPda =
          await program.account.userContributions.fetch(contributionsPdaKey);

        // return [] if no contribution
        if (
          !userContributionsPda ||
          userContributionsPda.contributions.length === 0
        ) {
          return [];
        }
        const contributions: AccountWrapper<Contribution>[] = [];
        for (let i = 0; i < userContributionsPda.contributions.length; i++) {
          try {
            const contributionPdaPublicKey =
              userContributionsPda.contributions[i];
            const contributionData = await program.account.contribution.fetch(
              contributionPdaPublicKey
            );

            if (contributionData) {
              contributions.push({
                publicKey: contributionPdaPublicKey,
                account: contributionData,
              });
            }
          } catch (error) {
            console.error(`Error fetching contribution ${i}:`, error);
          }
        }

        return contributions;
      },
      staleTime: 6000,
    });
  };

  //* Fetch a contributions PDA --------------
  const getContributionPda = (contributionPdaPublicKey: PublicKey | null) => {
    return useQuery({
      queryKey: ['contributionPda', contributionPdaPublicKey?.toString()],
      queryFn: async () => {
        if (!contributionPdaPublicKey) throw new Error('PublicKey is required');

        return program.account.contribution.fetch(contributionPdaPublicKey);
      },
      staleTime: 6000,
    });
  };

  //* MUTATIONS
  //* Add a contribution --------------------
  const addContribution = useMutation<PublicKey, Error, AddContributionArgs>({
    mutationKey: ['befundr', 'addContribution'],
    mutationFn: async ({
      projectPubkey,
      userPubkey,
      userWalletPubkey,
      projectContributionCounter,
      amount,
      reward
    }) => {
      const [contributionPdaPublicKey] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from('contribution'),
          projectPubkey.toBuffer(),
          new BN(projectContributionCounter + 1).toArray('le', 2),
        ],
        programId
      );

      // Get projectContributions PDA Pubkey
      const [projectContributionsPubkey] =
        await PublicKey.findProgramAddressSync(
          [Buffer.from('project_contributions'), projectPubkey.toBuffer()],
          program.programId
        );
      // Get userContributions PDA Pubkey
      const [userContributionsPubkey] = await PublicKey.findProgramAddressSync(
        [Buffer.from('user_contributions'), userPubkey.toBuffer()],
        programId
      );

      // Get SPL Token transfer accounts
      const { account: fromAta } = await getATA(userWalletPubkey, connection);
      const { account: toAta } = await getATA(projectPubkey, connection);

      // Call the addContribution method
      const tx = await program.methods
        .addContribution(new BN(amount))
        .accountsPartial({
          project: projectPubkey,
          projectContributions: projectContributionsPubkey,
          user: userPubkey,
          userContributions: userContributionsPubkey,
          contribution: contributionPdaPublicKey,
          fromAta: fromAta?.address,
          toAta: toAta?.address,
          tokenProgram: TOKEN_PROGRAM_ID,
          reward
        })
        .rpc(); // Launch the transaction

      // wait for the confirmation of the tx
      await confirmTransaction(program, tx);

      return contributionPdaPublicKey;
    },
    onSuccess: async () => {
      toast.success('Contribution made successfully!');
      allContributionsAccounts.refetch();
      // Optionally refetch any relevant queries or navigate to a different page
    },
    onError: async () => {
      toast.error('Error adding contribution');
    },
  });

  return {
    allContributionsAccounts,
    getUserContributionsPda,
    getAllUserContributions,
    getContributionPda,
    addContribution,
  };
}
