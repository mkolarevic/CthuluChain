import { Client } from '@hashgraph/sdk'

require('dotenv').config();

async function main() {
  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;

  if (!accountId || !privateKey) {
    throw new Error('Account ID or Private Key missing!')
  }

  const client = Client.forTestnet();

  client.setOperator(accountId, privateKey);
}

main()