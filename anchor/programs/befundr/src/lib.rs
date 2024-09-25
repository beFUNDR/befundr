use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;
use state::Reward;

declare_id!("29rtbJLEFXoCc6sTzp2jAHhXgrZTEb6EaMnUTDP14VFv");

#[program]
pub mod befundr {

    use super::*;

    /* User */

    pub fn create_user(
        ctx: Context<CreateUser>,
        name: Option<String>,
        avatar_url: Option<String>,
        bio: Option<String>,
        city: Option<String>,
    ) -> Result<()> {
        instructions::create_user(ctx, name, avatar_url, bio, city)
    }

    pub fn update_user(
        ctx: Context<UpdateUser>,
        name: Option<String>,
        avatar_url: Option<String>,
        bio: Option<String>,
        city: Option<String>,
    ) -> Result<()> {
        instructions::update_user(ctx, name, avatar_url, bio, city)
    }

    pub fn delete_user(ctx: Context<DeleteUser>) -> Result<()> {
        instructions::delete_user(ctx)
    }

    /* Project */

    pub fn create_project(
        ctx: Context<CreateProject>,
        name: String,
        image_url: String,
        description: String,
        goal_amount: u64,
        end_time: i64,
        rewards: Vec<Reward>,
        safety_deposit: u64,
    ) -> Result<()> {
        instructions::create_project(
            ctx,
            name,
            image_url,
            description,
            goal_amount,
            end_time,
            rewards,
            safety_deposit,
        )
    }

    /* Contribution */

    pub fn add_contribution(
        ctx: Context<AddContribution>,
        amount: u64,
        reward_id: u64,
    ) -> Result<()> {
        instructions::add_contribution(ctx, amount, reward_id)
    }

    pub fn cancel_contribution(ctx: Context<CancelContribution>) -> Result<()> {
        instructions::cancel_contribution(ctx)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
