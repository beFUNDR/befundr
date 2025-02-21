use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::{
    constants::{
        common::MAX_URI_LENGTH,
        project::{MAX_PROJECT_CAMPAIGN_DURATION, MIN_PROJECT_GOAL_AMOUNT, MIN_SAFETY_DEPOSIT},
    },
    errors::{AtaError, CommonError, CreateProjectError},
    state::{
        Project, ProjectContributions, ProjectSaleTransactions, ProjectStatus, Rewards,
        UnlockRequests, User,
    },
    utils::transfer_spl_token,
};

pub fn create_project(
    ctx: Context<CreateProject>,
    metadata_uri: String,
    goal_amount: u64,
    end_time: i64,
    safety_deposit: u64,
) -> Result<()> {
    let now: i64 = Clock::get()?.unix_timestamp;

    require!(metadata_uri.len() as u64 <= MAX_URI_LENGTH, CommonError::UriTooLong);

    require!(goal_amount > MIN_PROJECT_GOAL_AMOUNT, CreateProjectError::GoalAmountBelowLimit);
    require!(end_time > now, CreateProjectError::EndTimeInPast);
    require!(
        end_time < now + MAX_PROJECT_CAMPAIGN_DURATION,
        CreateProjectError::ExceedingEndTime
    );
    require!(
        safety_deposit >= MIN_SAFETY_DEPOSIT,
        CreateProjectError::InsufficientSafetyDeposit
    );

    let signer = &ctx.accounts.signer;
    let project = &mut ctx.accounts.project;

    project.owner = ctx.accounts.signer.key();
    project.user = ctx.accounts.user.key();
    project.metadata_uri = metadata_uri;
    project.goal_amount = goal_amount;
    project.raised_amount = 0;
    project.created_time = now;
    project.end_time = end_time;
    project.status = ProjectStatus::Fundraising;

    let to_ata = &ctx.accounts.to_ata;
    let from_ata = &ctx.accounts.from_ata;
    let token_program = &ctx.accounts.token_program;

    require!(from_ata.owner == signer.key(), AtaError::WrongAtaOwner);
    require!(to_ata.owner == project.key(), AtaError::WrongAtaOwner);

    transfer_spl_token(token_program, from_ata, to_ata, signer, safety_deposit)?;
    project.safety_deposit = safety_deposit;

    ctx.accounts.user.created_project_counter += 1;
    ctx.accounts.unlock_requests.project = project.key();
    ctx.accounts.project_sale_transactions.project = project.key();
    ctx.accounts.project_contributions.project = project.key();
    ctx.accounts.rewards.project = project.key();

    Ok(())
}

#[derive(Accounts)]
pub struct CreateProject<'info> {
    #[account(mut)]
    pub user: Box<Account<'info, User>>,

    #[account(
    init,
    payer = signer,
    space = 8 + Project::INIT_SPACE,
    seeds = [b"project", user.key().as_ref(), &(user.created_project_counter + 1).to_le_bytes()],
    bump
    )]
    pub project: Box<Account<'info, Project>>,

    #[account(
    init,
    payer = signer,
    space = 8 + Rewards::INIT_SPACE,
    seeds = [b"rewards", project.key().as_ref()],
    bump
    )]
    pub rewards: Box<Account<'info, Rewards>>,

    #[account(
    init,
    payer = signer,
    space = 8 + ProjectSaleTransactions::INIT_SPACE,
    seeds = [b"project_sale_transactions", project.key().as_ref()],
    bump
    )]
    pub project_sale_transactions: Box<Account<'info, ProjectSaleTransactions>>,

    #[account(
        init,
        payer = signer,
        space = 8 + ProjectContributions::INIT_SPACE,
        seeds = [b"project_contributions", project.key().as_ref()],
        bump
    )]
    pub project_contributions: Box<Account<'info, ProjectContributions>>,

    #[account(
        init,
        payer = signer,
        space = 8 + UnlockRequests::INIT_SPACE,
        seeds = [b"project_unlock_requests", project.key().as_ref()],
        bump
    )]
    pub unlock_requests: Box<Account<'info, UnlockRequests>>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub from_ata: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub to_ata: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}
