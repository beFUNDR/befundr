use crate::{
    errors::MarketplaceError,
    state::{
        user::User, Contribution, ContributionStatus, ProjectSaleTransactions, SaleTransaction,
    },
};
use anchor_lang::prelude::*;

pub fn create_transaction(ctx: Context<CreateTransaction>, selling_price: u64) -> Result<()> {
    let project_sale_transactions = &mut ctx.accounts.project_sale_transactions;
    let sale_transaction = &mut ctx.accounts.sale_transaction;
    let contribution = &mut ctx.accounts.contribution;
    let user = &mut ctx.accounts.user;

    require!(contribution.current_owner == user.key(), MarketplaceError::NotContributionOwner);
    require!(
        project_sale_transactions.project == contribution.project,
        MarketplaceError::WrongProjectSaleTransactions
    );

    match contribution.is_claimed {
        None => return Err(MarketplaceError::NoReward.into()),
        Some(true) => return Err(MarketplaceError::RewardAlreadyClaimed.into()),
        _ => {},
    }

    require!(
        contribution.get_status() == ContributionStatus::Active,
        MarketplaceError::ContributionNotActive,
    );

    require!(selling_price > 0, MarketplaceError::IncorrectSellingPrice);

    let now: i64 = Clock::get()?.unix_timestamp;

    sale_transaction.contribution = contribution.key();
    sale_transaction.contribution_amount = contribution.amount;
    sale_transaction.creation_timestamp = now;
    sale_transaction.seller = user.key();
    sale_transaction.selling_price = selling_price;
    project_sale_transactions
        .sale_transactions
        .push(sale_transaction.key());

    Ok(())
}

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + SaleTransaction::INIT_SPACE,
        seeds = [b"sale_transaction", contribution.key().as_ref()],
        bump
    )]
    pub sale_transaction: Account<'info, SaleTransaction>,

    #[account(mut)]
    pub project_sale_transactions: Account<'info, ProjectSaleTransactions>,

    #[account(mut, has_one = owner)]
    pub user: Account<'info, User>,

    #[account()]
    pub contribution: Account<'info, Contribution>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}
