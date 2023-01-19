import { Client, TransferTransaction } from '@hashgraph/sdk'
import { readFromFile } from './account.js'
import dotenv from 'dotenv'


async function fund() {
  const accNum = parseInt(process.argv[2]) - 1;
  const amount = parseInt(process.argv[3]) || 10;

  const accountList = readFromFile(process.env.ACCOUNTS_FILE);

  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;

  const client = Client.forName('testnet');
  client.setOperator(accountId, privateKey);


  const trx = await new TransferTransaction()
    .addHbarTransfer(accountId, -amount)
    .addHbarTransfer(accountList[accNum].id, amount)
    .execute(client)

  console.log(await trx.getReceipt(client));
}

dotenv.config()

await fund()

process.exit(0)