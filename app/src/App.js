import './App.css';
import { useState } from 'react';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json';


import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const network = clusterApiUrl('devnet');
const bs58 = require('bs58');
const secret = process.env.REACT_APP_DATAKEYPAIR;
const secretArray = new Uint8Array(bs58.decode(secret));
const dataKeypair = web3.Keypair.fromSecretKey(secretArray);

const wallets = [ getPhantomWallet() ]

const { SystemProgram } = web3;
const baseAccount = dataKeypair;
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
  const [value, setValue] = useState('');
  const [input, setInput] = useState('');
  const wallet = useWallet()

  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function initialize() {    
    const provider = await getProvider();
    /* create the program interface combining the idl, program ID, and provider */
    console.log("idl: " + JSON.stringify(idl));
    console.log("programID: " + programID);
    console.log("provider: " + provider.wallet.publicKey.toString());
    console.log("baseAccount: " + baseAccount.publicKey.toString());
    const program = await new Program(idl, programID.toString(), provider);
    console.log("program: " + program.programId);
    try {
      var account = await program.account.baseAccount.fetch(baseAccount.publicKey);

    } catch (err) {
      console.log("Cannot create acct: " + err);
      account = null; 
    }
    if (!account) {
      try {
        /* interact with the program via rpc */
        await program.rpc.initialize("Hello World", {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [baseAccount]
        });

        setValue(account.data.toString());
      } catch (err) {
        console.log("Transaction error: ", err);
      }
    } else {
      setValue(account.data.toString());
    }
  }

  async function update() {
    if (!input) return
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    let tokenInfo = await provider.connection.getParsedTokenAccountsByOwner(
      provider.wallet.publicKey,
      {
        programId: new PublicKey(TOKEN_PROGRAM_ID),
      },
    );   
    let hasValidToken = false;
    let currTokenAccount = "";
    for (let i = 0; i < tokenInfo.value.length; i++) {
      currTokenAccount = tokenInfo.value[i].pubkey.toString();
      const currMint = tokenInfo.value[i].account?.data?.parsed?.info?.mint;
      const currAmt = tokenInfo.value[i].account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      if (validTokens.includes(currMint) && currAmt >= 1) {
        hasValidToken = true;
        break;
      }
    }
    if (hasValidToken) {
      await program.rpc.updateAsHolder(input, {
        accounts: {
          // tokenAccount: userTokenAccount,
          tokenAccount: new PublicKey(currTokenAccount),
          user: provider.wallet.publicKey,
          baseAccount: baseAccount.publicKey
        },
      });

      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      setValue(account.data.toString());
      setInput('');
    } else {
      console.log("User does not hold a valid token to write data.");
    }
  }

  if (!wallet.connected) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="App">
        <div>
          {
            !value && (<button onClick={initialize}>Initialize</button>)
          }

          {
            (
              <div>
                <h2>Current value: {value}</h2>
                <input
                  placeholder="Add new data"
                  onChange={e => setInput(e.target.value)}
                  value={input}
                />
                <button onClick={update}>Add data</button>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint={network}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

const validTokens = [
  "teST8ZSPiHKifT6tvWhzQdSZz57NeaX7jaMkfGSwcyF",
  "testGaCLrEdHAhBkN2V44igJc7RfEoz3A2S63pW1rzV"
]

export default AppWithProvider;  