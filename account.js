import { PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar } from "@hashgraph/sdk";
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'

const fileName = 'accounts.txt'

export async function createAccount(client, name) {

  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  //Create a new account
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .execute(client);

  // Get the new account ID
  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  const accountBuf = `${name} ${newAccountId.shard.low}.${newAccountId.realm.low}.${newAccountId.num.low}\n`

  console.log(newAccountId)

  //Log the account ID
  console.log("The new account ID is: " + accountBuf);

  try {
    fs.appendFileSync(fileName, accountBuf)
  } catch (error) {
    fs.writeFileSync(fileName, accountBuf)
  }
  //Verify the account balance
  let accountBalance;
  if (newAccountId) {
    accountBalance = await new AccountBalanceQuery()
      .setAccountId(newAccountId)
      .execute(client);
    console.log("The new account balance is: " + accountBalance.hbars.toTinybars() + " tinybar.");
  }

  return {
    newAccountPrivateKey,
    newAccountPublicKey,
    newAccount,
    getReceipt,
    newAccountId
  }
}
