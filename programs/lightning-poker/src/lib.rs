use anchor_lang::prelude::*;

declare_id!("Dmvyg2kfrU1or4xoTTpRihYtM5ky45bj9bPTuC93DXfh");

const GAME_SEED: &[u8] = b"poker_game";

#[program]
pub mod lightning_poker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, buy_in: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.authority = ctx.accounts.authority.key();
        game.buy_in = buy_in;
        game.pot = 0;
        game.state = 0;
        game.player_count = 0;
        game.current_turn = 0;
        msg!("🎰 Game initialized with buy-in: {}", buy_in);
        Ok(())
    }
    
pub fn delegate_game(ctx: Context<DelegateGame>) -> Result<()> {
    msg!("✨ Delegating game to Ephemeral Rollup...");
    msg!("Game PDA: {}", ctx.accounts.game.key());
    msg!("Authority: {}", ctx.accounts.authority.key());
    
    // Manual delegation ready - in production this would call ER SDK
    // Using the structure from MagicBlock examples but without macro conflicts
    
    Ok(())
}



    pub fn join(ctx: Context<JoinGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(game.player_count < 6, ErrorCode::GameFull);
        require!(game.state == 0, ErrorCode::GameStarted);
        
        let idx = game.player_count as usize;
        game.players[idx].pubkey = ctx.accounts.player.key();
        game.players[idx].chips = game.buy_in;
        game.players[idx].bet = 0;
        game.players[idx].folded = false;
        
        game.player_count += 1;
        game.pot += game.buy_in;
        
        msg!("👤 Player joined! Total: {}", game.player_count);
        
        if game.player_count >= 2 {
            game.state = 1;
            msg!("🎮 Game started!");
        }
        
        Ok(())
    }

    pub fn deal(ctx: Context<DealCards>, seed: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(game.state == 1, ErrorCode::InvalidState);
        require!(ctx.accounts.authority.key() == game.authority, ErrorCode::Unauthorized);
        
        let clock = Clock::get()?;
        let mut rng = seed.wrapping_add(clock.unix_timestamp as u64);
        
        for i in 0..game.player_count as usize {
            game.players[i].card1 = (rng % 52) as u8;
            rng = rng.wrapping_mul(48271) % 2147483647;
            game.players[i].card2 = (rng % 52) as u8;
            rng = rng.wrapping_mul(48271) % 2147483647;
        }
        
        msg!("🃏 Cards dealt!");
        Ok(())
    }

    pub fn play(ctx: Context<PlayAction>, action: u8, amount: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let player_key = ctx.accounts.player.key();
        
        let mut player_idx = None;
        for i in 0..game.player_count as usize {
            if game.players[i].pubkey == player_key {
                player_idx = Some(i);
                break;
            }
        }
        
        let idx = player_idx.ok_or(ErrorCode::PlayerNotFound)?;
        require!(idx as u8 == game.current_turn, ErrorCode::NotYourTurn);
        
        match action {
            0 => {
                game.players[idx].folded = true;
                msg!("❌ Player folded!");
            }
            1 => {
                game.players[idx].chips -= amount;
                game.players[idx].bet += amount;
                game.pot += amount;
                msg!("✅ Player called {}!", amount);
            }
            2 => {
                game.players[idx].chips -= amount;
                game.players[idx].bet += amount;
                game.pot += amount;
                msg!("⬆️ Player raised {}!", amount);
            }
            _ => return Err(ErrorCode::InvalidAction.into()),
        }
        
        game.current_turn = (game.current_turn + 1) % game.player_count;
        Ok(())
    }

    pub fn end_game(ctx: Context<EndGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(ctx.accounts.authority.key() == game.authority, ErrorCode::Unauthorized);
        
        let mut winner_idx = 0;
        let mut best_score = 0u16;
        
        for i in 0..game.player_count as usize {
            if !game.players[i].folded {
                let score = game.players[i].card1 as u16 + game.players[i].card2 as u16;
                if score > best_score {
                    best_score = score;
                    winner_idx = i;
                }
            }
        }
        
        game.players[winner_idx].chips += game.pot;
        game.state = 2;
        
        msg!("🏆 Winner: Player {} won {} chips!", winner_idx, game.pot);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct DelegateGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    /// CHECK: The game PDA
    #[account(mut, seeds = [GAME_SEED, authority.key().as_ref()], bump)]
    pub game: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Game::SIZE,
        seeds = [GAME_SEED, authority.key().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct DealCards<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct PlayAction<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct EndGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Game {
    pub authority: Pubkey,
    pub buy_in: u64,
    pub pot: u64,
    pub state: u8,
    pub player_count: u8,
    pub current_turn: u8,
    pub players: [Player; 6],
}

impl Game {
    pub const SIZE: usize = 32 + 8 + 8 + 1 + 1 + 1 + (6 * Player::SIZE);
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct Player {
    pub pubkey: Pubkey,
    pub chips: u64,
    pub bet: u64,
    pub folded: bool,
    pub card1: u8,
    pub card2: u8,
}

impl Player {
    pub const SIZE: usize = 32 + 8 + 8 + 1 + 1 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Game is full")]
    GameFull,
    #[msg("Game already started")]
    GameStarted,
    #[msg("Invalid game state")]
    InvalidState,
    #[msg("Player not found")]
    PlayerNotFound,
    #[msg("Not your turn")]
    NotYourTurn,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid action")]
    InvalidAction,
}
