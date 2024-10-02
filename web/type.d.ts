type AccountWrapper<T> = {
  publicKey: PublicKey;
  account: T;
};

type Project = {
  owner: PublicKey;
  user: string;
  name: string;
  category: ProjectCategory;
  imageUrl: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  timestamp: number;
  endTime: number;
  status: ProjectStatus;
  contributionCounter: number;
  trustScore: number; // init between 75 to 100
  rewards: Reward[];
  safetyDeposit: number;
  xAccountUrl: string;
};

type Reward = {
  id: string;
  name: string;
  imageUrl: string;
  imageFile?: File; // only to handle creation process
  description: string;
  price: number;
  maxSupply: number | null;
  currentSupply: number;
  isAvailable: boolean;
  redeemLimitTime?: number;
};

type User = {
  owner: PublicKey;
  name?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdProjectCounter: number;
};

type Feed = {
  title: string;
  type: 'information' | 'funds unlock' | 'milestone';
  timestamp: number;
  description: string;
};

type Contribution = {
  id: string;
  initialOwner: string;
  currentOwner: string;
  amount: number;
  rewardId: string;
  timestamp: number;
  isForSale: boolean;
  sellingPrice?: number;
};

type SaleTransaction = {
  seller: string;
  projectId: string;
  rewardId: string;
  contributionAmount: number;
  sellingPrice: number;
  creationTimestamp: number;
};

type FundsRequest = {
  id: string;
  title: string;
  amountAsked: number;
  timestamp: number;
  description: string;
  status: 'ongoing' | 'accepted' | 'rejected';
  voteFor: number;
  voteAgainst: number;
};
