import EventEmitter from "eventemitter3"
import solanaWeb3 from "@solana/web3.js"
import { Account, PublicKey, Transaction, Connection } from "@solana/web3.js"
import { WalletAdapter } from "@solana/wallet-base"
import Torus from "@toruslabs/torus-embed"
import OpenLogin from "@toruslabs/openlogin"
import { getED25519Key } from "@toruslabs/openlogin-ed25519"

const getSolanaPrivateKey = (openloginKey: string)=>{
  const  { sk } = getED25519Key(openloginKey)
  return sk
}

export class TorusWalletAdapter extends EventEmitter implements WalletAdapter {
  // _provider: Torus | undefined;
  _provider: OpenLogin | undefined;
  endpoint: string;
  providerUrl: string;
  account: Account | undefined;
  image: string = '';
  name: string = '';

  autoConnect = true;

  constructor(providerUrl: string, endpoint: string) {
    super()
    this.connect = this.connect.bind(this)
    this.endpoint = endpoint;
    this.providerUrl = providerUrl;
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if(this.account) {
      let account = this.account;
      transactions.forEach(t => t.partialSign(account));
    }

    return transactions
  }

  get publicKey() {
    return this.account?.publicKey || null;
  }

  async signTransaction(transaction: Transaction) {
    if(this.account) {
      transaction.partialSign(this.account)
    }

    return transaction
  }

  connect = async () => {
    this._provider = new OpenLogin({
      clientId: process.env.REACT_APP_CLIENT_ID || 'BKBTX-SmaEFGddZQrwqd65YFoImRQLca_Tj2IdmKyD2UbDpzrtN2WQ-NYLuej6gP0DfF3jSpEkI13wPt1uPedm0',
      network: "mainnet", // mainnet, testnet, development
    });

    try {
      await this._provider.init();
    } catch (ex) {
      console.error('init failed', ex)
    }

    console.error(this._provider?.state.store);

    if (this._provider.privKey) {
      const privateKey = this._provider.privKey;
      const secretKey = getSolanaPrivateKey(privateKey);
      this.account = new Account(secretKey);
    } else {
      try {
        const { privKey } = await this._provider.login();
        const secretKey = getSolanaPrivateKey(privKey);
        this.account = new Account(secretKey);
      } catch {
        //
      }
    }

    this.name = this._provider?.state.store.get('name');;
    this.image = this._provider?.state.store.get('profileImage');;



    this.emit("connect");
  }

  disconnect = async () => {
    console.log("Disconnecting...")
    if (this._provider) {
      await this._provider.logout();
      await this._provider._cleanup();
      this._provider = undefined;
      this.emit("disconnect");
    }
  }
}
