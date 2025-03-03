import { BN } from "@coral-xyz/anchor";
import { convertAmountToDecimals } from "../utils/tokenUtils";
import { Reward } from "./reward_type";

export const reward1: Reward = {
    metadataUri: '/reward1',
    price: convertAmountToDecimals(100),
    maxSupply: new BN(25),
    currentSupply: new BN(0)
};

export const reward2: Reward = {
    metadataUri: '/reward2',
    price: convertAmountToDecimals(50),
    maxSupply: new BN(50),
    currentSupply: new BN(0)
};

export const reward3: Reward = {
    metadataUri: '/reward3',
    price: convertAmountToDecimals(25),
    maxSupply: new BN(0),
    currentSupply: new BN(0)
};