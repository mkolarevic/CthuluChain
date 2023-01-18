import { Client } from '@hashgraph/sdk'
import { createAccount } from './account.js'
import dotenv from 'dotenv'
dotenv.config()

async function main() {
  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;

  if (!accountId || !privateKey) {
    throw new Error('Account ID or Private Key missing!')
  }

  const client = Client.forTestnet();

  client.setOperator(accountId, privateKey);

  for (let index = 1; index < 6; index++) {
    const name = `Account${index}:`
    await createAccount(client, name);
  }
}

main()
