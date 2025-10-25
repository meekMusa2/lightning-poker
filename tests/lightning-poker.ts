import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LightningPoker } from "../target/types/lightning_poker";

describe("lightning-poker", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LightningPoker as Program<LightningPoker>;

  it("Full poker game flow", async () => {
    const [gameAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("poker_game"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    console.log("🎰 Initializing game...");
    await program.methods
      .initialize(new anchor.BN(1000))
      .accounts({
        game: gameAccount,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Game initialized!");

    // Join game
    console.log("👤 Joining game...");
    await program.methods
      .join()
      .accounts({
        game: gameAccount,
        player: provider.wallet.publicKey,
      })
      .rpc();

    console.log("✅ Joined!");

    // Fetch and display game state
    const gameState = await program.account.game.fetch(gameAccount);
    console.log("Game state:", {
      buyIn: gameState.buyIn.toString(),
      pot: gameState.pot.toString(),
      playerCount: gameState.playerCount,
    });
  });
});
