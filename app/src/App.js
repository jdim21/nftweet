import './App.css';
import { useState } from 'react';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json';


import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

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
    // const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function initialize() {    
    const provider = await getProvider();
    /* create the program interface combining the idl, program ID, and provider */
    const program = new Program(idl, programID, provider);
    console.log(program);
    try {
      var account = await program.account.baseAccount.fetch(baseAccount.publicKey);

    } catch (err) {
      console.log("cant create acct: " + err);
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
    await program.rpc.updateAsHolder(input, {
      accounts: {
        tokenAccount: new PublicKey("CogUbKa4K3kmsLtthpPqUkswo2B4fLbH9ZVk5iQ9ytjY"),
        user: provider.wallet.publicKey,
        baseAccount: baseAccount.publicKey
      },
    });

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('account: ', account);
    setValue(account.data.toString());
    setInput('');
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

export default AppWithProvider;  