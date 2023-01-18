import { PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, PublicKey } from "@hashgraph/sdk";
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
export async function readFromFile(filePath) {
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
 * @returns {Promise<Object>}
 */
export async function createAccount(client) {

  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  //Create a new account
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .execute(client);

  // Get the new account ID
  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  const id = `${newAccountId.shard.low}.${newAccountId.realm.low}.${newAccountId.num.low}`
  const acc = {
    id,
    privateKey: newAccountPrivateKey.toStringRaw(),
    publicKey: newAccountPublicKey.toStringRaw(),
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
