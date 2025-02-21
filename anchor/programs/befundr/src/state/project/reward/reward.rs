use anchor_lang::prelude::*;

use crate::{
    constants::common::MAX_URI_LENGTH,
    errors::{CommonError, RewardError},
};

#[account]
#[derive(InitSpace)]
pub struct Reward {
    pub project: Pubkey,
    #[max_len(MAX_URI_LENGTH)]
    pub metadata_uri: String,
    pub price: u64,
    pub max_supply: Option<u16>,
    pub current_supply: u32,
}

impl Reward {
    pub fn validate(&self) -> Result<()> {
        // Validate name length
        require!(self.metadata_uri.len() as u64 <= MAX_URI_LENGTH, CommonError::UriTooLong);

        // Validate price
        require!(self.price > 0, RewardError::InvalidPrice);

        // Validate current supply if max_supply is defined
        if let Some(max) = self.max_supply {
            require!(max > 0, RewardError::MaxSupplyInvalid);
            require!(self.current_supply <= max.into(), RewardError::CurrentSupplyInvalid);
        }

        Ok(())
    }

    /// Adds one to the current supply of the reward.
    /// Ensures that the current supply does not exceed the maximum supply.
    pub fn add_supply(&mut self) -> Result<()> {
        if self
            .max_supply
            .map_or(true, |max_supply| self.current_supply < max_supply.into())
        {
            self.current_supply += 1;
        } else {
            return Err(RewardError::RewardSupplyReached.into());
        }

        Ok(())
    }

    /// Removes one from the current supply of the reward.
    /// Ensures that the current supply does not go below zero.
    pub fn remove_supply(&mut self) -> Result<()> {
        if self.current_supply > 0 {
            self.current_supply -= 1;
        } else {
            return Err(RewardError::RewardSupplyEmpty.into());
        }

        Ok(())
    }
}
