use anchor_lang::prelude::*;

use crate::constants::unlock_request_vote::MAX_VOTE_NUMBER;

use super::UnlockStatus;

#[account]
#[derive(InitSpace)]
pub struct UnlockRequest {
    pub project: Pubkey,
    pub amount_requested: u64,
    pub votes_against: u64,
    pub created_time: i64,
    pub end_time: i64,
    pub unlock_time: i64,
    pub status: UnlockStatus,
    pub is_claimed: bool,

    #[max_len(MAX_VOTE_NUMBER)]
    pub votes: Vec<Pubkey>,
}

impl UnlockRequest {}
