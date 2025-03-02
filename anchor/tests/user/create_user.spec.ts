import { userData1, userData2, userData3 } from './user_dataset';
import { createUser, createUserWalletWithSol } from '../utils/testUtils';
import { program } from '../config';

describe('createUser', () => {

  it("Creates 3 users", async () => {
    const userDataList = [userData1, userData2, userData3]
    for (let i = 0; i < 3; i++) {
      const userWallet = await createUserWalletWithSol();
      const userData = userDataList[i];

      const userPda = await createUser(userData, userWallet);

      // Fetch the created user profile
      const user = await program.account.user.fetch(userPda);

      // Assert that the user profile was created correctly
      expect(user.owner.toString()).toEqual(userWallet.publicKey.toString());
      expect(user.createdProjectCounter).toEqual(0);
    }
  });

  it("Creates 2 users", async () => {
    for (let i = 0; i < 2; i++) {
      const userWallet = await createUserWalletWithSol();

      const userPda = await createUser({}, userWallet);

      // Fetch the created user profile
      const user = await program.account.user.fetch(userPda);

      // Assert that the user profile was created correctly
      expect(user.owner.toString()).toEqual(userWallet.publicKey.toString());
      expect(user.createdProjectCounter).toEqual(0);
    }
  });

});
