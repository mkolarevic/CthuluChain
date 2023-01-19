import { Hbar, TransferTransaction, Client, ScheduleCreateTransaction, PrivateKey, Transaction } from "@hashgraph/sdk";
import { readFromFile } from "./account.js";

export async function scheduledTransaction() {
  const accs = readFromFile(process.env.ACCOUNTS_FILE);
  console.log('MY ACCS: ', accs)

  const acc1 = accs[0];
  const acc2 = accs[1];

  const client = Client.forName('testnet');
  client.setOperator(acc1.id, acc1.privateKey);


  const trx = new TransferTransaction()
    .addHbarTransfer(acc1.id, new Hbar(-10))
    .addHbarTransfer(acc2.id, new Hbar(10))

  const scheduleTransaction = new ScheduleCreateTransaction()
    .setScheduledTransaction(trx)
    .setScheduleMemo("Use with caution")
    .setAdminKey(PrivateKey.fromString(acc1.privateKey))
    .freezeWith(client);

  const serialized = Buffer.from(scheduleTransaction.toBytes()).toString('hex')

  console.log('SER', serialized)


  return serialized
}

export async function processScheduled(serializedTx) {
  const txn = Transaction.fromBytes(Buffer.from(serializedTx, 'hex'))

  const accs = readFromFile(process.env.ACCOUNTS_FILE);
  console.log('MY ACCS: ', accs)

  const acc1 = accs[0];

  const client = Client.forName('testnet');
  client.setOperator(acc1.id, acc1.privateKey);

  txn.sign(PrivateKey.fromString(acc1.privateKey))

  await txn.execute(client)

  console.log('DE', txn)
} 