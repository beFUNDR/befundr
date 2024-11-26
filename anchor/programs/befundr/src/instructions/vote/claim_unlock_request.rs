use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};

use crate::{
    errors::{AtaError, ClaimUnlockRequestError},
    state::{Project, UnlockRequest, UnlockRequests, User},
};

pub fn claim_unlock_request(
    ctx: Context<ClaimUnlockRequest>,
    created_project_counter: u16,
) -> Result<()> {
    let now: i64 = Clock::get()?.unix_timestamp;

    let project = &mut ctx.accounts.project;
    let user = &mut ctx.accounts.user;
    let unlock_requests = &mut ctx.accounts.unlock_requests;
    let current_unlock_request = &mut ctx.accounts.current_unlock_request;
    let to_ata = &ctx.accounts.to_ata;
    let from_ata = &ctx.accounts.from_ata;
    let authority = &ctx.accounts.owner;

    require!(
        current_unlock_request.end_time <= now,
        ClaimUnlockRequestError::RequestNotClaimable,
    );

    require!(
        !current_unlock_request.is_claimed,
        ClaimUnlockRequestError::RequestAlreadyClaimed,
    );

    require!(from_ata.owner == project.key(), AtaError::WrongAtaOwner);
    require!(to_ata.owner == authority.key(), AtaError::WrongAtaOwner);

    current_unlock_request.is_claimed = true;

    let bump = &[ctx.bumps.project];
    let binding = user.key();
    let seeds: &[&[u8]] = &[
        b"project",
        binding.as_ref(),
        &(created_project_counter).to_le_bytes(),
        bump,
    ];
    let signer_seeds = &[&seeds[..]];

    unlock_requests.unlocked_amount += current_unlock_request.amount_requested;

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: from_ata.to_account_info(),
                to: to_ata.to_account_info(),
                authority: project.to_account_info(),
            },
            signer_seeds,
        ),
        current_unlock_request.amount_requested,
    )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(created_project_counter: u16)]
pub struct ClaimUnlockRequest<'info> {
    #[account(has_one = owner)]
    pub user: Account<'info, User>,

    #[account(has_one = project,
         seeds = [b"project_unlock_requests", project.key().as_ref()],
         bump)]
    pub unlock_requests: Account<'info, UnlockRequests>,

    #[account(mut,
      has_one = project,
      seeds = [b"unlock_request", project.key().as_ref(), &(unlock_requests.request_counter + 0).to_le_bytes()],
      bump
    )]
    pub current_unlock_request: Account<'info, UnlockRequest>,

    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub to_ata: Account<'info, TokenAccount>,

    #[account(has_one = user,
        seeds = [b"project", user.key().as_ref(), &(created_project_counter + 0).to_le_bytes()],
        bump)]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}
