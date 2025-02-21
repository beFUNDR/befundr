use anchor_lang::prelude::*;

#[derive(Copy, Clone, InitSpace, AnchorSerialize, AnchorDeserialize, PartialEq, Eq)]
pub enum ContributionStatus {
    Active,
    Cancelled,
}

#[account]
#[derive(InitSpace)]
pub struct Contribution {
    //Should contain Signer Pubkey
    pub initial_owner: Pubkey, // User PDA pubkey
    pub current_owner: Pubkey, // User PDA pubkey
    pub project: Pubkey,
    pub amount: u64,
    pub creation_timestamp: i64,
    pub is_claimed: Option<bool>,
    status: ContributionStatus,
    pub reward: Option<Pubkey>,
}

impl Contribution {
    pub fn get_status(&self) -> ContributionStatus {
        self.status
    }

    pub fn is_active(&self) -> bool {
        self.status == ContributionStatus::Active
    }

    pub fn set_active(&mut self) {
        self.status = ContributionStatus::Active;
    }

    pub fn set_cancelled(&mut self) {
        self.status = ContributionStatus::Cancelled;
    }
}
