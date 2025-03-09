use anchor_lang::prelude::*;

use crate::{
    errors::{OwnershipError, StartProjectError},
    state::{Project, ProjectStatus, User},
};

pub fn start_project(ctx: Context<StartProject>) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let signer = &ctx.accounts.signer;

    require!(project.owner == signer.key(), OwnershipError::WrongOwner);
    require!(project.status == ProjectStatus::Fundraising, StartProjectError::WrongStatus);
    require!(
        project.raised_amount >= project.goal_amount,
        StartProjectError::InsufficientRaisedAmount
    );

    project.status = ProjectStatus::Realising;

    Ok(())
}

#[derive(Accounts)]
pub struct StartProject<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
