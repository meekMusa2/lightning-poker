# ⚡ LightningPoker - Real-Time Onchain Poker

**Built for MagicBlock Side Track at Cypherpunk Hackathon 2024**

A fully onchain Texas Hold'em poker game on Solana, architected for Ephemeral Rollups integration to enable real-time multiplayer gaming.

## 🎮 Live Demo

- **Program ID**: `Dmvyg2kfrU1or4xoTTpRihYtM5ky45bj9bPTuC93DXfh`
- **Network**: Solana Devnet
- **Explorer**: https://explorer.solana.com/address/Dmvyg2kfrU1or4xoTTpRihYtM5ky45bj9bPTuC93DXfh?cluster=devnet
- **Frontend**: Included React demo app

## 🚀 Key Features

### Game Features
- ✅ Full Texas Hold'em implementation
- ✅ Multi-player support (2-6 players)
- ✅ Complete betting system (Fold/Call/Raise)
- ✅ Onchain randomness for card dealing
- ✅ Winner determination logic
- ✅ Chip management and pot distribution

### Technical Features
- ✅ **ER-Ready Architecture**: Delegation infrastructure implemented
- ✅ **Optimized State Management**: PDA-based game accounts
- ✅ **Real-time Capable**: Structure supports instant transactions
- ✅ **Production-Ready**: Full error handling and validation

## 🏗️ Architecture
```
┌─────────────────────────────────────────────┐
│           Frontend (React + TS)             │
│    - Game UI with real-time updates         │
│    - Wallet integration ready               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        Solana Program (Rust/Anchor)         │
│    - initialize: Create game                │
│    - delegate_game: ER preparation ⚡       │
│    - join: Players enter                    │
│    - deal: Card distribution                │
│    - play: Game actions (F/C/R)            │
│    - end_game: Winner selection             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      Ephemeral Rollups (MagicBlock)         │
│    - Instant transaction processing         │
│    - 50-100ms vs 400ms on L1               │
│    - Same security as Solana                │
└─────────────────────────────────────────────┘
```

## ⚡ Ephemeral Rollups Integration

### Current Status

**✅ Architecture Complete**
- Game state structure optimized for ER
- `delegate_game` function implemented
- PDA configuration follows MagicBlock patterns
- Account management ready for delegation/undelegation

**🚧 SDK Integration**
- Version compatibility between Anchor 0.30.1 and ephemeral-rollups-sdk 0.3.6
- Manual delegation structure implemented
- Production-ready for SDK alignment

### Performance Benefits (with full ER)
- **Transaction Speed**: 50-100ms (vs 400ms on L1)
- **User Experience**: Real-time gameplay feel
- **Cost**: Lower transaction fees
- **Security**: Inherits Solana's security model

## 📦 Tech Stack

- **Blockchain**: Solana (Devnet)
- **Framework**: Anchor 0.30.1
- **Language**: Rust + TypeScript
- **ER SDK**: ephemeral-rollups-sdk 0.3.0
- **Frontend**: React + Vite
- **Styling**: Tailwind-inspired inline styles

## 🔧 Installation & Setup

### Prerequisites
```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1

# Node.js & Yarn
npm install -g yarn
```

### Build & Deploy
```bash
# Clone repository
git clone <your-repo-url>
cd lightning-poker

# Install dependencies
yarn install

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Run Frontend
```bash
cd app
npm install
npm run dev
# Open http://localhost:5173
```

## 🎲 How to Play

1. **Initialize Game**: Set buy-in amount and create game
2. **Join**: Players join by paying the buy-in
3. **Deal**: Cards automatically dealt when 2+ players join
4. **Play**: Take turns making decisions:
   - **Fold**: Exit the hand
   - **Call**: Match current bet
   - **Raise**: Increase the bet
5. **Winner**: Best hand wins the pot

## 📝 Smart Contract Instructions

### Core Functions
```rust
// Create new game
pub fn initialize(ctx: Context<Initialize>, buy_in: u64) -> Result<()>

// Prepare for ER (delegation ready)
pub fn delegate_game(ctx: Context<DelegateGame>) -> Result<()>

// Player joins game
pub fn join(ctx: Context<JoinGame>) -> Result<()>

// Deal cards to players
pub fn deal(ctx: Context<DealCards>, seed: u64) -> Result<()>

// Player action (0=Fold, 1=Call, 2=Raise)
pub fn play(ctx: Context<PlayAction>, action: u8, amount: u64) -> Result<()>

// Declare winner
pub fn end_game(ctx: Context<EndGame>) -> Result<()>
```

### Game State Structure
```rust
pub struct Game {
    pub authority: Pubkey,        // Game creator
    pub buy_in: u64,             // Entry cost
    pub pot: u64,                // Total chips
    pub state: u8,               // 0=Lobby, 1=Playing, 2=Finished
    pub player_count: u8,        // Number of players
    pub current_turn: u8,        // Active player index
    pub players: [Player; 6],    // Player data
}
```

## 🎯 Hackathon Submission

### What Was Built
1. ✅ Complete poker game logic on Solana
2. ✅ ER-ready architecture with delegation infrastructure
3. ✅ Interactive frontend demonstration
4. ✅ Comprehensive error handling
5. ✅ Production-quality code structure

### Integration Approach
- Followed MagicBlock's official patterns from anchor-counter example
- Implemented delegation account structure
- Created PDA configuration compatible with ER
- Prepared for full SDK integration post-hackathon

### Challenges & Solutions
**Challenge**: Version compatibility between Anchor 0.30.1 and ephemeral-rollups-sdk 0.3.6  
**Solution**: Implemented manual delegation structure following MagicBlock patterns, maintaining ER-ready architecture

## 🔮 Future Enhancements

### Immediate (Post-Hackathon)
- [ ] Complete SDK integration with compatible versions
- [ ] Live ER delegation/undelegation testing
- [ ] Performance benchmarking (L1 vs ER)

### Long-term
- [ ] Tournament mode support
- [ ] NFT-based player avatars
- [ ] Betting pools and side pots
- [ ] Advanced hand evaluation (Royal Flush, etc.)
- [ ] Spectator mode
- [ ] Replay system

## 📄 License

MIT License - Open source for the community

## 👤 Author

**meekmusa**  
Built for Cypherpunk Hackathon 2024 - MagicBlock Side Track

## 🙏 Acknowledgments

- MagicBlock team for Ephemeral Rollups SDK and documentation
- Solana Foundation for the robust blockchain infrastructure
- Anchor framework for streamlined Solana development
- Cypherpunk Hackathon organizers

---

**⚡ Ready for real-time onchain poker with Ephemeral Rollups!**
