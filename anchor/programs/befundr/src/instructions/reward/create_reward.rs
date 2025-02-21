use crate::constants::common::MAX_URI_LENGTH;
use crate::errors::CommonError;
use crate::{
    errors::RewardError,
    state::{Project, Reward, Rewards, User},
};
use anchor_lang::prelude::*;

pub fn create_reward(
    ctx: Context<CreateReward>,
    metadata_uri: String,
    max_supply: Option<u16>,
    price: u64,
) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let reward = &mut ctx.accounts.reward;
    let rewards = &mut ctx.accounts.rewards;

    require!(price > 0, RewardError::InvalidPrice);
    require!(metadata_uri.len() as u64 <= MAX_URI_LENGTH, CommonError::UriTooLong);

    reward.metadata_uri = metadata_uri;
    reward.max_supply = max_supply;
    reward.project = project.key();
    reward.price = price;

    rewards.reward_counter += 1;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateReward<'info> {
    #[account(mut, has_one = user)]
    pub project: Account<'info, Project>,

    #[account(init,
        payer = owner,
        space = 8 + Reward::INIT_SPACE, seeds = [b"reward", project.key().as_ref(), &(rewards.reward_counter + 1).to_le_bytes()], bump)]
    pub reward: Account<'info, Reward>,

    #[account(mut, has_one = project)]
    pub rewards: Account<'info, Rewards>,

    #[account(mut, has_one = owner)]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}
