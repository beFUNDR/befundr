use anchor_lang::prelude::*;

use crate::constants::common::MAX_URI_LENGTH;

#[account]
#[derive(InitSpace)]
pub struct Project {
    pub owner: Pubkey,
    pub user: Pubkey,

    #[max_len(MAX_URI_LENGTH)]
    pub metadata_uri: String,

    pub goal_amount: u64,
    pub raised_amount: u64,
    pub created_time: i64,
    pub fundraising_end_time: i64,
    pub end_time: i64,
    pub status: ProjectStatus,
    pub contribution_counter: u16,

    pub safety_deposit: u64,
}

impl Project {}

#[derive(Clone, InitSpace, AnchorSerialize, AnchorDeserialize, PartialEq, Eq)]
pub enum ProjectStatus {
    Draft,
    Fundraising,
    Realising,
    Completed,
    Abandoned,
    Suspended,
}
