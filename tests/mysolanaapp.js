const assert = require("assert");
const anchor = require("@project-serum/anchor");
const spl = require("@solana/spl-token");
const { Token } = require("@solana/spl-token/lib/index.cjs");
// import * as spl from '@solana/spl-token';
const { SystemProgram } = anchor.web3;

describe("Mysolanaapp", () => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Mysolanaapp;
  it("It initializes the account", async () => {
    const baseAccount = anchor.web3.Keypair.generate();
    await program.rpc.initialize("Hello World", {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('Data: ', account.data);
    assert.ok(account.data === "Hello World");
    _baseAccount = baseAccount;

  });

  it("Fails to call update_as_holder without holding teST", async () => {
    const baseAccount = _baseAccount;
    const kp = anchor.web3.Keypair.fromSecretKey(new Uint8Array([72,185,43,145,208,213,225,241,71,184,41,79,75,69,20,228,149,227,142,108,74,198,228,154,239,25,106,149,17,98,52,4,13,213,101,214,179,77,36,144,40,33,203,4,142,231,209,51,4,163,102,66,253,205,222,150,52,9,4,251,195,220,191,134]));
    const token = new spl.Token(
      program.provider.connection,
      new anchor.web3.PublicKey("teST8ZSPiHKifT6tvWhzQdSZz57NeaX7jaMkfGSwcyF"),
      spl.TOKEN_PROGRAM_ID,
      kp
    );
    someTokenAccount = await token.getOrCreateAssociatedAccountInfo(
      new anchor.web3.PublicKey(program.provider.wallet.publicKey)
    )
    try {
      await program.rpc.updateAsHolder("Some data that souldn't be written", {
        accounts: {
          tokenAccount: someTokenAccount.address,
          user: kp.publicKey,
          baseAccount: baseAccount.publicKey
        },
        signers: [kp]
      });
    } catch (error) {
      assert.equal(error.msg, "You must hold TODO in order to perform this action.");
      return;
    }
  });

  it("Calls update_as_holder when holding teST", async () => {
    const baseAccount = _baseAccount;
    const kp = anchor.web3.Keypair.fromSecretKey(new Uint8Array([72,185,43,145,208,213,225,241,71,184,41,79,75,69,20,228,149,227,142,108,74,198,228,154,239,25,106,149,17,98,52,4,13,213,101,214,179,77,36,144,40,33,203,4,142,231,209,51,4,163,102,66,253,205,222,150,52,9,4,251,195,220,191,134]));
    const token = new spl.Token(
      program.provider.connection,
      new anchor.web3.PublicKey("teST8ZSPiHKifT6tvWhzQdSZz57NeaX7jaMkfGSwcyF"),
      spl.TOKEN_PROGRAM_ID,
      kp
    );
    someTokenAccount = await token.getOrCreateAssociatedAccountInfo(
      new anchor.web3.PublicKey(program.provider.wallet.publicKey)
    )
    await token.mintTo(someTokenAccount.address, kp, [], 3000000000);
    try {
      await program.rpc.updateAsHolder("Some new data", {
        accounts: {
          tokenAccount: someTokenAccount.address,
          user: kp.publicKey,
          baseAccount: baseAccount.publicKey
        },
        signers: [kp]
      });
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log('Updated data: ', account.data)
      assert.ok(account.data === "Some new data");
      console.log('all account data:', account)
      console.log('All data: ', account.dataList);
      assert.ok(account.dataList.length === 2);
    } catch (error) {
      assert.fail("Should not error: " + error);
    }
    await token.burn(someTokenAccount.address, kp, [], 3000000000);
  });

  it("Calls update_as_holder when holding test", async () => {
    const baseAccount = _baseAccount;
    const kp = anchor.web3.Keypair.fromSecretKey(new Uint8Array([72,185,43,145,208,213,225,241,71,184,41,79,75,69,20,228,149,227,142,108,74,198,228,154,239,25,106,149,17,98,52,4,13,213,101,214,179,77,36,144,40,33,203,4,142,231,209,51,4,163,102,66,253,205,222,150,52,9,4,251,195,220,191,134]));
    const token = new spl.Token(
      program.provider.connection,
      new anchor.web3.PublicKey("testGaCLrEdHAhBkN2V44igJc7RfEoz3A2S63pW1rzV"),
      spl.TOKEN_PROGRAM_ID,
      kp
    );
    someTokenAccount = await token.getOrCreateAssociatedAccountInfo(
      new anchor.web3.PublicKey(program.provider.wallet.publicKey)
    )
    await token.mintTo(someTokenAccount.address, kp, [], 3000000000);
    try {
      await program.rpc.updateAsHolder("Some 2nd new data", {
        accounts: {
          tokenAccount: someTokenAccount.address,
          user: kp.publicKey,
          baseAccount: baseAccount.publicKey
        },
        signers: [kp]
      });
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log('Updated data: ', account.data)
      assert.ok(account.data === "Some 2nd new data");
      console.log('all account data:', account)
      console.log('All data: ', account.dataList);
      assert.ok(account.dataList.length === 3);
    } catch (error) {
      assert.fail("Should not error: " + error);
    }
    await token.burn(someTokenAccount.address, kp, [], 3000000000);
  });
});