use anchor_lang::prelude::*;
use anchor_spl::{
    // associated_token::AssociatedToken,
    token::{TokenAccount},
};

declare_id!("4FKLNRC1Gm57NjPmbNg6afBwWJoiNzgHLBv26mw2sFN8");

#[program]
mod mysolanaapp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let copy = data.clone();
        base_account.data = data;
        base_account.data_list.push(copy);
        Ok(())
    }

    pub fn update_as_holder(ctx: Context<UpdateAsHolder>, data: String) -> ProgramResult {
        let amt = ctx.accounts.token_account.amount;
        msg!("amt: {}", amt);
        if amt < 1000000000 {
            return Err(ErrorCode::Unauthorized.into());
        }
        let base_account = &mut ctx.accounts.base_account;
        let copy = data.clone();
        base_account.data = data;
        base_account.data_list.push(copy);
        msg!("data: {}", base_account.data);
        msg!("getting token bal... {}", amt);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 64 + 64)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

fn is_access_token(input_token: anchor_lang::solana_program::pubkey::Pubkey) -> bool {
    let v = [
        "teST8ZSPiHKifT6tvWhzQdSZz57NeaX7jaMkfGSwcyF".to_owned(),
        "testGaCLrEdHAhBkN2V44igJc7RfEoz3A2S63pW1rzV".to_owned()
    ];
    let input_token_str = &bs58::encode(input_token).into_string();
    msg!("Validating against input_token: {}", input_token);
    if v.contains(input_token_str) {
        return true;
    }
    return false;
}

#[derive(Accounts)]
pub struct UpdateAsHolder<'info> {
    #[account(mut, constraint = is_access_token(token_account.mint))]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut, constraint = user.key == &token_account.owner)]
    pub user: AccountInfo<'info>,
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
pub struct BaseAccount {
    pub data: String,
    pub data_list: Vec<String>,
}

#[error]
pub enum ErrorCode {
    #[msg("You must hold TODO in order to perform this action.")]
    Unauthorized,
}
