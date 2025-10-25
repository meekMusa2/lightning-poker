import { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import './App.css';

// Your deployed program ID
const PROGRAM_ID = new PublicKey('45upeRdaE7yoahWBUsYLZhMHBUDnraygHBTGZiaQm4aW');
const GAME_SEED = 'poker_game';

function App() {
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [buyIn, setBuyIn] = useState(1000);

  // Setup connection
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Create a dummy wallet for demo
  const setupWallet = () => {
    const keypair = Keypair.generate();
    setWallet(keypair);
    setConnected(true);
    setStatus('Demo wallet created! Address: ' + keypair.publicKey.toString().slice(0, 8) + '...');
  };

  // Get game PDA address
  const getGameAddress = async () => {
    if (!wallet) return null;
    const [gameAccount] = await PublicKey.findProgramAddressSync(
      [Buffer.from(GAME_SEED), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );
    return gameAccount;
  };

  // Initialize game
  const initializeGame = async () => {
    if (!wallet) {
      setStatus('Please connect wallet first!');
      return;
    }

    setLoading(true);
    setStatus('Initializing game...');

    try {
      const gameAccount = await getGameAddress();
      setStatus(`Creating game at: ${gameAccount.toString().slice(0, 8)}...`);

      // Simulate game initialization
      setTimeout(() => {
        setGameState({
          authority: wallet.publicKey.toString(),
          buyIn: Number(buyIn),
          pot: 0,
          playerCount: 0,
          state: 0 // Lobby
        });
        setStatus('✅ Game initialized! (Demo mode - in production this would create an onchain transaction)');
        setLoading(false);
      }, 1500);

    } catch (error) {
      setStatus('❌ Error: ' + error.message);
      setLoading(false);
    }
  };

  // Join game
  const joinGame = async () => {
    setLoading(true);
    setStatus('Joining game...');
    
    setTimeout(() => {
      const newPlayerCount = gameState.playerCount + 1;
      const newPot = gameState.pot + gameState.buyIn;
      const newState = newPlayerCount >= 2 ? 1 : 0;
      
      setGameState({
        ...gameState,
        playerCount: newPlayerCount,
        pot: newPot,
        state: newState
      });
      
      setStatus(
        newPlayerCount >= 2 
          ? '✅ Joined! Game starting with ' + newPlayerCount + ' players!' 
          : '✅ Joined! Waiting for more players... (' + newPlayerCount + '/2)'
      );
      setLoading(false);
    }, 1000);
  };

  // Deal cards
  const dealCards = async () => {
    setLoading(true);
    setStatus('Dealing cards...');
    
    setTimeout(() => {
      setStatus('🃏 Cards dealt! Each player has 2 hole cards. Game in progress!');
      setLoading(false);
    }, 1000);
  };

  // Make a play
  const makePlay = (action) => {
    setLoading(true);
    const actions = { fold: 'folded', call: 'called', raise: 'raised' };
    setStatus(`Player ${actions[action]}! ${action === 'raise' ? 'Pot increased!' : ''}`);
    
    setTimeout(() => {
      if (action === 'raise') {
        setGameState({
          ...gameState,
          pot: gameState.pot + 100
        });
      }
      setStatus('✅ Action completed! Next player\'s turn.');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="App">
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⚡ LightningPoker</h1>
        <p style={styles.subtitle}>Real-Time Onchain Texas Hold'em</p>
        <div style={styles.badge}>
          <span style={styles.badgeIcon}>🚀</span>
          <span>Powered by MagicBlock Ephemeral Rollups</span>
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Network:</span>
          <span style={styles.statusValue}>Solana Devnet</span>
        </div>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Program:</span>
          <span style={styles.statusValue}>45upe...m4aW</span>
        </div>
        <div style={styles.statusItem}>
          <span style={styles.statusLabel}>Status:</span>
          <span style={{...styles.statusValue, color: connected ? '#4ade80' : '#fbbf24'}}>
            {connected ? '● Connected' : '○ Not Connected'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.container}>
        {!connected ? (
          // Connect Wallet Screen
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Welcome to LightningPoker</h2>
            <p style={styles.cardText}>
              This is a fully onchain poker game built on Solana with Ephemeral Rollups support.
              Connect your wallet to start playing!
            </p>
            <button onClick={setupWallet} style={styles.button}>
              🔗 Connect Demo Wallet
            </button>
            <p style={styles.note}>
              Note: This demo uses a temporary wallet. In production, you'd connect Phantom/Solflare.
            </p>
          </div>
        ) : !gameState ? (
          // Create Game Screen
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Create New Game</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Buy-in Amount (chips):</label>
              <input
                type="number"
                value={buyIn}
                onChange={(e) => setBuyIn(Number(e.target.value))}
                style={styles.input}
                min="100"
                step="100"
              />
            </div>
            <button 
              onClick={initializeGame} 
              disabled={loading}
              style={styles.button}
            >
              {loading ? '⏳ Creating...' : '🎰 Create Game'}
            </button>
            
            <div style={styles.infoBox}>
              <h3 style={styles.infoTitle}>What happens when you create a game?</h3>
              <ul style={styles.infoList}>
                <li>✅ Initializes a new game account on Solana</li>
                <li>✅ Sets you as the game authority (dealer)</li>
                <li>✅ Opens lobby for other players to join</li>
                <li>✅ Game starts when 2+ players join</li>
                <li>⚡ With Ephemeral Rollups: Actions process in 50-100ms!</li>
              </ul>
            </div>
          </div>
        ) : (
          // Game Screen
          <div>
            <div style={styles.gameCard}>
              <h2 style={styles.cardTitle}>
                {gameState.state === 0 ? '🎲 Lobby' : gameState.state === 1 ? '🎮 Playing' : '🏆 Finished'}
              </h2>
              
              <div style={styles.gameStats}>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Pot</div>
                  <div style={styles.statValue}>{gameState.pot} chips</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Players</div>
                  <div style={styles.statValue}>{gameState.playerCount}/6</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Buy-in</div>
                  <div style={styles.statValue}>{gameState.buyIn}</div>
                </div>
              </div>

              <div style={styles.actionButtons}>
                {gameState.state === 0 && (
                  <button 
                    onClick={joinGame} 
                    disabled={loading}
                    style={styles.button}
                  >
                    {loading ? '⏳ Joining...' : '👤 Join Game'}
                  </button>
                )}
                {gameState.state === 1 && (
                  <>
                    <button 
                      onClick={dealCards} 
                      disabled={loading}
                      style={{...styles.button, marginBottom: '15px'}}
                    >
                      {loading ? '⏳ Dealing...' : '🃏 Deal Cards'}
                    </button>
                    
                    <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                      <button 
                        onClick={() => makePlay('fold')}
                        disabled={loading}
                        style={{...styles.smallButton, background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'}}
                      >
                        ❌ Fold
                      </button>
                      <button 
                        onClick={() => makePlay('call')}
                        disabled={loading}
                        style={{...styles.smallButton, background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'}}
                      >
                        ✅ Call
                      </button>
                      <button 
                        onClick={() => makePlay('raise')}
                        disabled={loading}
                        style={{...styles.smallButton, background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'}}
                      >
                        ⬆️ Raise
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={styles.infoBox}>
              <h3 style={styles.infoTitle}>🎯 How it works:</h3>
              <ol style={styles.infoList}>
                <li><strong>Initialize:</strong> Create game with buy-in amount</li>
                <li><strong>Join:</strong> Players join and pay buy-in (adds to pot)</li>
                <li><strong>Deal:</strong> Cards dealt to all players when game starts</li>
                <li><strong>Play:</strong> Players take turns (Fold/Call/Raise)</li>
                <li><strong>Winner:</strong> Best hand wins the pot</li>
              </ol>
              
              <div style={{marginTop: '20px', padding: '15px', background: '#1e293b', borderRadius: '8px'}}>
                <h4 style={{color: '#fbbf24', marginBottom: '10px'}}>⚡ With Ephemeral Rollups:</h4>
                <p style={{color: '#94a3b8', fontSize: '14px', margin: 0}}>
                  • Actions process in <strong style={{color: '#22c55e'}}>50-100ms</strong> (vs 400ms on L1)<br/>
                  • Real-time game state updates<br/>
                  • Lower transaction costs<br/>
                  • Same security as Solana mainnet
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status && (
          <div style={styles.statusMessage}>
            {status}
          </div>
        )}

        {/* View on Explorer */}
        <a
          href={`https://explorer.solana.com/address/${PROGRAM_ID.toString()}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.explorerLink}
        >
          🔍 View Program on Solana Explorer →
        </a>
      </div>
    </div>
  );
}

const styles = {
  header: {
    textAlign: 'center',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    borderBottom: '2px solid #334155'
  },
  title: {
    fontSize: '48px',
    margin: '0 0 10px 0',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '18px',
    color: '#94a3b8',
    margin: '0 0 20px 0'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '20px',
    color: '#22c55e',
    fontSize: '14px'
  },
  badgeIcon: {
    fontSize: '16px'
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    padding: '15px',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    flexWrap: 'wrap'
  },
  statusItem: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  statusLabel: {
    color: '#64748b',
    fontSize: '14px'
  },
  statusValue: {
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '600'
  },
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px'
  },
  card: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '40px',
    border: '1px solid #334155'
  },
  gameCard: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '30px',
    border: '1px solid #334155',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '28px',
    marginBottom: '20px',
    color: '#f8fafc'
  },
  cardText: {
    color: '#94a3b8',
    lineHeight: '1.6',
    marginBottom: '30px'
  },
  inputGroup: {
    marginBottom: '25px'
  },
  label: {
    display: 'block',
    color: '#e2e8f0',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '16px'
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  smallButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  note: {
    marginTop: '15px',
    color: '#64748b',
    fontSize: '12px',
    textAlign: 'center'
  },
  infoBox: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '30px',
    border: '1px solid #1e293b'
  },
  infoTitle: {
    color: '#fbbf24',
    fontSize: '16px',
    marginBottom: '15px'
  },
  infoList: {
    color: '#94a3b8',
    lineHeight: '1.8',
    margin: 0,
    paddingLeft: '20px'
  },
  gameStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '25px'
  },
  statBox: {
    background: '#0f172a',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #1e293b'
  },
  statLabel: {
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  statValue: {
    color: '#fbbf24',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  statusMessage: {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '8px',
    color: '#60a5fa',
    textAlign: 'center'
  },
  explorerLink: {
    display: 'block',
    marginTop: '20px',
    padding: '12px',
    textAlign: 'center',
    color: '#60a5fa',
    textDecoration: 'none',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    transition: 'background 0.2s'
  }
};

export default App;
