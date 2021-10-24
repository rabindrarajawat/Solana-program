import {
    ConfirmOptions,
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Signer,
    SystemProgram,
    Transaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '../constants';
import { createInitializeMintInstruction } from '../instructions';
import { getMinimumBalanceForRentExemptMint, MINT_SIZE } from '../state';

/**
 * Create and initialize a new mint
 *
 * @param connection      Connection to use
 * @param payer           Payer of the transaction and initialization fees
 * @param mintAuthority   Account or multisig that will control minting
 * @param freezeAuthority Optional account or multisig that can freeze token accounts
 * @param decimals        Location of the decimal place
 * @param confirmOptions  Options for confirming the transaction
 * @param programId       SPL Token program account
 *
 * @return Address of the new mint
 */
export async function createMint(
    connection: Connection,
    payer: Signer,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    decimals: number,
    confirmOptions?: ConfirmOptions,
    programId = TOKEN_PROGRAM_ID
): Promise<PublicKey> {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const mint = Keypair.generate();

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint.publicKey,
            space: MINT_SIZE,
            lamports,
            programId,
        }),
        createInitializeMintInstruction(mint.publicKey, decimals, mintAuthority, freezeAuthority, programId)
    );

    await sendAndConfirmTransaction(connection, transaction, [payer, mint], confirmOptions);

    return mint.publicKey;
}