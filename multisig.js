import { TransferTransaction, Client, PrivateKey, ScheduleSignTransaction, ScheduleCreateTransaction } from '@hashgraph/sdk'
import { readFromFile } from './account.js'

import dotenv from 'dotenv'

export async function main() {
  const accs = readFromFile(process.env.ACCOUNTS_FILE)

  const acc1 = accs[0]
  const acc2 = accs[1]
  const acc3 = accs[2]
  const acc4 = accs[2]

  // Account1 is the treasury
  const treasuryClient = Client.forName('testnet')
    .setOperator(acc1.id, acc1.privateKey)

  // Account2 is the client which creates the child and scheduled transactions
  const client = Client.forName('testnet')
    .setOperator(acc2.id, acc2.privateKey)

  // Account 3 is the receiver, theoretically its signature is not necessary
  const receiverClient = Client.forName('testnet')
    .setOperator(acc3.id, acc3.privateKey)

  // Create the multisig transfer transaction, freeze it and sign it
  const trx = new TransferTransaction()
    .addHbarTransfer(acc1.id, -3)
    .addHbarTransfer(acc3.id, 3)
    .addHbarTransfer(acc4.id, -3)
    .addHbarTransfer(acc3.id, 3)
    .setTransactionMemo('Buy something beautiful')

  // Schedule the multisig inside a scheduled tx using the Account2 client
  // Set the admin key to be the key of Account1
  const scheduleTransaction = await new ScheduleCreateTransaction()
    .setScheduledTransaction(trx)
    .setScheduleMemo("Please don't lose this pls")
    .setAdminKey(PrivateKey.fromString(acc2.privateKey))
    .setTransactionMemo('Desi batice')
    .execute(client)

  const scheduledReceipt = await scheduleTransaction.getReceipt(client)

  // Freeze the tx with the treasury client and sign it
  const transactionTreasury = await new ScheduleSignTransaction()
    .setScheduleId(scheduledReceipt.scheduleId)
    .freezeWith(treasuryClient)
    .sign(PrivateKey.fromString(acc1.privateKey))

  const submittedTreasury = await transactionTreasury.execute(treasuryClient)

  console.log((await submittedTreasury.getReceipt()).scheduledTransactionId)

  const transactionReceiver = await new ScheduleSignTransaction()
    .setScheduleId(scheduledReceipt.scheduleId)
    .freezeWith(receiverClient)
    .sign(PrivateKey.fromString(acc1.privateKey))

  const submittedReceiver = await transactionReceiver.execute(client)

  const receipt = await submittedReceiver.getReceipt(client)
  console.log(receipt)
}

dotenv.config()

await main()

process.exit(0)
