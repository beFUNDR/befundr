#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

declare_id!("GwhXp6uzcsDPb8Git18t1pKAqE7zb9Jmviay6ffBdXfk");

#[program]
pub mod befundr {

    use super::*;

    /* User */

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        instructions::create_user(ctx)
    }

    pub fn delete_user(ctx: Context<DeleteUser>) -> Result<()> {
        instructions::delete_user(ctx)
    }

    /* Project */

    pub fn create_project(
        ctx: Context<CreateProject>,
        metadata_uri: String,
        goal_amount: u64,
        end_time: i64,
        safety_deposit: u64,
    ) -> Result<()> {
        instructions::create_project(ctx, metadata_uri, goal_amount, end_time, safety_deposit)
    }

    /* Contribution */

    pub fn add_contribution(ctx: Context<AddContribution>, amount: u64) -> Result<()> {
        instructions::add_contribution(ctx, amount)
    }

    pub fn cancel_contribution(ctx: Context<CancelContribution>) -> Result<()> {
        instructions::cancel_contribution(ctx)
    }

    pub fn create_unlock_request(
        ctx: Context<CreateUnlockRequest>,
        amount_requested: u64,
    ) -> Result<()> {
        instructions::create_unlock_request(ctx, amount_requested)
    }

    pub fn claim_unlock_request(
        ctx: Context<ClaimUnlockRequest>,
        created_project_counter: u16,
    ) -> Result<()> {
        instructions::claim_unlock_request(ctx, created_project_counter)
    }

    pub fn create_transaction(ctx: Context<CreateTransaction>, selling_price: u64) -> Result<()> {
        instructions::create_transaction(ctx, selling_price)
    }

    pub fn complete_transaction(ctx: Context<CompleteTransaction>) -> Result<()> {
        instructions::complete_transaction(ctx)
    }

    pub fn create_reward(
        ctx: Context<CreateReward>,
        metadata_uri: String,
        max_supply: Option<u16>,
        price: u64,
    ) -> Result<()> {
        instructions::create_reward(ctx, metadata_uri, max_supply, price)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
