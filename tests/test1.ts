import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Pda } from "../target/types/pda"; // auto-generated after `anchor build`

describe("pda", () => {
  // Set up the provider from your local wallet + devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Pda as Program<Pda>;
  const wallet = provider.wallet;

  const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("message"), wallet.publicKey.toBuffer()],
    program.programId
  );

  // CREATE
  it("Create Message Account", async () => {
    const message = "Hello, World!";
    const transactionSignature = await program.methods
      .create(message)
      .accounts({})
      .rpc({ commitment: "confirmed" });

    const messageAccount = await program.account.messageAccount.fetch(
      messagePda,
      "confirmed"
    );

    console.log(JSON.stringify(messageAccount, null, 2));
    console.log(
      "Transaction Signature:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
    );
  });

  // UPDATE
  it("Update Message Account", async () => {
    const message = "Hello, Solana!";
    const transactionSignature = await program.methods
      .update(message)
      .accounts({})
      .rpc({ commitment: "confirmed" });

    const messageAccount = await program.account.messageAccount.fetch(
      messagePda,
      "confirmed"
    );

    console.log(JSON.stringify(messageAccount, null, 2));
    console.log(
      "Transaction Signature:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
    );
  });

  // DELETE
  it("Delete Message Account", async () => {
    const transactionSignature = await program.methods
      .delete()
      .accounts({})
      .rpc({ commitment: "confirmed" });

    const messageAccount = await program.account.messageAccount.fetchNullable(
      messagePda,
      "confirmed"
    );

    console.log("Expect Null:", JSON.stringify(messageAccount, null, 2));
    console.log(
      "Transaction Signature:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
    );
  });
});
