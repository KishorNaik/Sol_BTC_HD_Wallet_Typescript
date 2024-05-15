import * as bitcoin from "bitcoinjs-lib";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import { BIP32Interface } from "bip32";
import { Payment } from "bitcoinjs-lib";

export interface GenerateWalletOptions {
  seed: Buffer;
  path: number;
}

export interface GenerateWalletResult {
  address: string;
  privateKey: string;
  publicKey: string;
}

export interface IBtcWallet {
  generateWalletAsync(
    params: GenerateWalletOptions
  ): Promise<GenerateWalletResult>;
}

export class BtcWallet implements IBtcWallet {
  public generateWalletAsync(
    params: GenerateWalletOptions
  ): Promise<GenerateWalletResult> {
    return new Promise((resolve, reject) => {
      try {
        // Get Seed and Path
        const { seed, path } = params;

        const bip32 = BIP32Factory(ecc);
        const hdWallet = bip32.fromSeed(seed);

        const wallet_hdpath = "m/44'/0'/0'/0/";
        const wallet_hdpath_extended = wallet_hdpath + path;
        const wallet = hdWallet.derivePath(wallet_hdpath_extended);

        // Get Address from Node Wallet
        const bitCoinPaymentResult: Payment = bitcoin.payments.p2pkh({
          pubkey: wallet.publicKey,
        });

        // Get Private Key
        const privateKey = wallet.toWIF();

        // Get Public Key
        const publicKey = wallet.publicKey.toString("hex");

        const result: GenerateWalletResult = {
          address: bitCoinPaymentResult.address!,
          privateKey,
          publicKey,
        };
        resolve(result);
      } catch (ex) {
        reject(ex);
      }
    });
  }
}
