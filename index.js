import { Client } from '@hashgraph/sdk'
import { createAccount, readFromFile } from './account.js'
import dotenv from 'dotenv'

async function main() {
  const accountId = process.env.ACCOUNT_ID
  const privateKey = process.env.PRIVATE_KEY
  const filePath = process.env.ACCOUNTS_FILE

  if (!accountId || !privateKey) {
    throw new Error('Account ID or Private Key missing!')
  }

  const client = Client.forName('testnet')
  client.setOperator(accountId, privateKey)

  // get the list of existing accounts
  const accountList = readFromFile(filePath)

  if (!accountList.length) {
    for (let index = 0; index < 5; index++) {
      accountList.push(await createAccount(client))
    }
  }

  process.exit(0)
}

dotenv.config()

main()
