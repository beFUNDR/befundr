pub mod project {
    pub const MIN_SAFETY_DEPOSIT: u64 = 50_000_000;
    pub const MIN_PROJECT_GOAL_AMOUNT: u64 = 0; //USD
    pub const MIN_PROJECT_CAMPAIGN_DURATION: i64 = 86400; // 1 day
    pub const MAX_PROJECT_CAMPAIGN_DURATION: i64 = 86400 * 90; //90 days
    pub const MIN_REWARDS_NUMBER: u16 = 1; //Min of 1 reward
}

pub mod project_contributions {
    pub const MAX_CONTRIBUTIONS_NUMBER: u32 = 300;
}

pub mod project_sale_transactions {
    pub const MAX_SALE_TRANSACTIONS_NUMBER: u32 = 100;
}

pub mod user_contributions {
    pub const MAX_CONTRIBUTIONS_NUMBER: u32 = 100;
}

pub mod unlock_request_vote {
    pub const MAX_VOTE_NUMBER: u64 = 100;
}

pub mod unlock_request {
    pub const MAX_REQUEST_NUMBER: u64 = 100;
    pub const MAX_REQUESTED_PERCENTAGE_AMOUNT: u64 = 30;
    pub const VOTING_PERIOD: i64 = 86400 * 7;
    pub const REQUEST_COOLDOWN: i64 = 86400 * 7;
    pub const REJECTED_REQUEST_COOLDOWN: i64 = 86400 * 14;
}

pub mod marketplace {
    pub const MAX_HISTORY_TRANSACTIONS_NUMBER: u32 = 85;
}

pub mod common {
    pub const MAX_URI_LENGTH: u64 = 256;
}

// Temporary admins keys const
// FOR LOCAL DEV PURPOSES ONLY
pub const ADMIN_PUBKEYS: &[&str] = &[
    "5djqaFNzTZtvfbpgQqyQ8NVNzn1DU1Fof9snJyKZM1oD",
    // Add more admin public keys as needed
];
