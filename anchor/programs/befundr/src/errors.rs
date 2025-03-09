use anchor_lang::prelude::*;

#[error_code]
pub enum DeleteUserError {
    #[msg("Unauthorized: Only the admin can delete users.")]
    Unauthorized,
    #[msg("User has associated projects or contributions.")]
    UserHasActivity,
    #[msg("Wrong owner account.")]
    WrongOwnerAccount,
}

#[error_code]
pub enum CreateProjectError {
    #[msg("Goal amount is too low (min $1).")]
    GoalAmountBelowLimit,
    #[msg("End time is in the past.")]
    EndTimeInPast,
    #[msg("End time beyond the limit.")]
    ExceedingEndTime,
    #[msg("Safety deposit is too low (min $50).")]
    InsufficientSafetyDeposit,
}

#[error_code]
pub enum RewardError {
    #[msg("Price must be greater than 0.")]
    InvalidPrice,
    #[msg("Current supply must be greater than 0.")]
    CurrentSupplyInvalid,
    #[msg("Max supply must be greater than or equal to current supply.")]
    MaxSupplyInvalid,
    #[msg("Reward supply has reached its maximum limit.")]
    RewardSupplyReached,
    #[msg("Supply is empty.")]
    RewardSupplyEmpty,
}

#[error_code]
pub enum ContributionError {
    #[msg("Project fundraising has ended.")]
    ProjectNotFundraising,
    #[msg("Signer must be the user.")]
    SignerNotUser,
    #[msg("Reward does not exist.")]
    RewardError,
    #[msg("Incorrect reward")]
    IncorrectReward,
    #[msg("Reward already reserved.")]
    RewardAlreadyReserved,
    #[msg("Contribution amount is insufficient for the selected reward.")]
    RewardPriceError,
    #[msg("Unauthorized action.")]
    Unauthorized,
}

#[error_code]
pub enum TransferError {
    #[msg("Funds transfer failed.")]
    TransferFailed,
}

#[error_code]
pub enum CreateUnlockRequestError {
    #[msg("Requested amount to unlock is too high")]
    RequestedAmountTooHigh,
    #[msg("Insufficient remaining funds")]
    NotEnoughFunds,
    #[msg("The project is not in realization")]
    WrongProjectStatus,
    #[msg("There is already a vote ongoing")]
    UnlockVoteAlreadyOngoing,
    #[msg("Request cooldown ongoing")]
    WaitBeforeNewRequest,
}

#[error_code]
pub enum ClaimUnlockRequestError {
    #[msg("Unlock request already claimed")]
    RequestAlreadyClaimed,
    #[msg("Unlock request still ongoing")]
    RequestNotClaimable,
}

#[error_code]
pub enum MarketplaceError {
    #[msg("Signer is not the contribution owner")]
    NotContributionOwner,
    #[msg("Wrong project sale transactions PDA")]
    WrongProjectSaleTransactions,
    #[msg("The reward has been already claimed")]
    RewardAlreadyClaimed,
    #[msg("No reward associated to this contribution")]
    NoReward,
    #[msg("The contribution is not active")]
    ContributionNotActive,
    #[msg("Incorrect selling price")]
    IncorrectSellingPrice,
    #[msg("Buyer is not the user")]
    BuyerNotUser,
    #[msg("Seller is not the user")]
    SellerNotUser,
    #[msg("The seller is not the contribution owner")]
    SellerNotContributionOwner,
}

#[error_code]
pub enum UserContributionsError {
    #[msg("Contribution not found")]
    ContributionNotFound,
}

#[error_code]
pub enum AtaError {
    #[msg("Wrong owner for the given ATA")]
    WrongAtaOwner,
}

#[error_code]
pub enum ProjectSaleTransactionError {
    #[msg("Sale Transaction not found")]
    SaleTransactionNotFound,
}

#[error_code]
pub enum CommonError {
    #[msg("URI is too long (max 256 characters).")]
    UriTooLong,
}

#[error_code]
pub enum OwnershipError {
    #[msg("Invalid owner")]
    WrongOwner,
}

#[error_code]
pub enum StartProjectError {
    #[msg("The project is not in fundraising status")]
    WrongStatus,
    #[msg("The raised amount is lower than the goal amount")]
    InsufficientRaisedAmount,
}
