import { PublicKey } from "@solana/web3.js";
import { type Pda } from "@/types/pda"; // Make sure to place your pda.ts file in lib/pda.ts
import IDL from "@/types/pda.json"; // Generate this via `anchor build` and place in lib/

export const PROGRAM_ID = new PublicKey(
  "HDuNqTrDwC7FYrgrvRoQiCu2vDtEy4q9cAsxY1mzF22s"
);

export const getMessagePda = (userPubkey: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("message"), userPubkey.toBuffer()],
    PROGRAM_ID
  );
};

export { IDL, type Pda };
