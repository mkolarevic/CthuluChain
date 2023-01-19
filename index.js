import { Client } from '@hashgraph/sdk'
import { createAccount, readFromFile } from './account.js'
import dotenv from 'dotenv'
import { multiSigTrx } from './multisig.js';
import { processScheduled, scheduledTransaction } from './scheduled.js';

dotenv.config()

async function main() {
  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;
  const filePath = process.env.ACCOUNTS_FILE;

  // get the list of existing accounts
  let accountList = readFromFile(filePath);

  const client = Client.forName('testnet');
  client.setOperator(accountId, privateKey);

  if (!accountList.length) {
    for (let index = 0; index < 5; index++) {
      accountList.push(await createAccount(client))
    }
  }

  console.log(accountList)

  if (!accountId || !privateKey) {
    throw new Error('Account ID or Private Key missing!')
  }





  //await multiSigTrx()

  const serialized = await scheduledTransaction();

  await processScheduled(serialized)

  process.exit(0)
}

main()
