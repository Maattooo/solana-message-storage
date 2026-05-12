use anchor_lang::prelude::*;
use crate::state::NewAccount;

#[derive(Accounts)]
pub struct Initialize<'info> {
    // First 8 bytes are default account discriminator,
    // next 8 bytes come from NewAccount.data being type u64.
    #[account(
        init,
        payer = signer,
        space = 8 + 8
    )]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, data: u64) -> Result<()> {
    ctx.accounts.new_account.data = data;
    msg!("Changed data to: {}!", data);
    Ok(())
}