import { PrivateKey, AccountCreateTransaction, Hbar, TransferTransaction, Client } from "@hashgraph/sdk";
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'

const fileName = 'accounts.json'

/**
 * Attempts to return an array of account IDs from the specified file.
 * Returns an empty array if the file doesn't exist
 * @param {string} filePath
 * @returns {Promise<Array<string>>}
 */
export function readFromFile(filePath) {
  try {
    const accs = fs.readFileSync(filePath);
    return JSON.parse(accs)?.accounts
  } catch (error) {
    return []
  }
}

/**
 * Creates an account and returns it's ID and keys
 * @param {Client} client Hedera Client object
 * 
 * @typedef {Object} accountData
 * @property {string} id Account ID (0.0.xxx)
 * @property {string} privateKey Private key
 * @property {string} publicKey Public key
 * @property {Object} privateKeyObject Private key in object form
 * @property {Object} publicKeyObject Public key in object form
 * @returns {Promise<mintedNfts>} 
 */
export async function createAccount(client) {

  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  //Create a new account
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(20)
    .execute(client);

  // Get the new account ID
  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  const id = `${newAccountId.shard.low}.${newAccountId.realm.low}.${newAccountId.num.low}`
  const acc = {
    id,
    privateKey: newAccountPrivateKey.toStringRaw(),
    publicKey: newAccountPublicKey.toStringRaw(),
    privateKeyObject: newAccountPrivateKey,
    publicKeyObject: newAccountPublicKey,
  }

  try {
    const data = fs.readFileSync(fileName)
    let accData = JSON.parse(data);
    accData.accounts.push(acc)
    fs.writeFileSync(fileName, JSON.stringify(accData, null, 2))
  } catch (error) {
    let accData = {
      accounts: [acc]
    }
    fs.writeFileSync(fileName, JSON.stringify(accData, null, 2))
  }

  return acc
}

/**
 * 
 * @typedef {Object} transactionDetails
 * @property {string} from Account ID of the sender
 * @property {string} privateKey Private key of the sender
 * @property {string} to Account ID of the recipient
 * @property {number} amount Amount of HBAR to transfer
 * 
 * @param {transactionDetails} transactionDetails 
 * @returns 
 */
export async function transferFunds({ from, privateKey, to, amount }) {

  const client = Client.forName('testnet');
  client.setOperator(from, privateKey);

  // Create a transaction to transfer hbars
  const transaction = new TransferTransaction()
    .addHbarTransfer(from, new Hbar(-amount))
    .addHbarTransfer(to, new Hbar(amount));

  //Submit the transaction to a Hedera network
  const txResponse = await transaction.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction consensus status
  const transactionStatus = receipt.status.toString();

  console.log("The transaction consensus status is " + transactionStatus);

  return receipt.status
}