use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub owner: Pubkey,
    pub created_project_counter: u16,
}

impl Default for User {
    fn default() -> Self {
        Self {
            owner: Pubkey::default(),
            created_project_counter: 0,
        }
    }
}
