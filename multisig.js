import { AccountId, Hbar, TransferTransaction, Client, PrivateKey, ScheduleSignTransaction, ScheduleCreateTransaction } from "@hashgraph/sdk";
import { readFromFile } from "./account.js";

export async function main() {

  const accs = readFromFile(process.env.ACCOUNTS_FILE);

  let acc1 = accs[0];
  let acc2 = accs[1];
  let acc3 = accs[2];

  // Account1 is the treasury
  const treasuryClient = Client.forName('testnet')
    .setOperator(acc1.id, acc1.privateKey);

  // Account2 is the client which creates the child and scheduled transactions
  const client = Client.forName('testnet')
    .setOperator(acc2.id, acc2.privateKey);

  // Account3 is the receiver
  const receiverClient = Client.forName('testnet')
    .setOperator(acc3.id, acc3.privateKey);

  // Create the multisig transfer transaction, freeze it and sign it
  const trx = new TransferTransaction()
    .addHbarTransfer(acc1.id, -3)
    .addHbarTransfer(acc3.id, 3)
    .addHbarTransfer(acc2.id, -3)
    .addHbarTransfer(acc3.id, 3)
    .setTransactionMemo('Buy something beautiful');

  // Schedule the multisig inside a scheduled tx using the Account2 client
  // Set the admin key to be the key of Account1
  const scheduleTransaction = await new ScheduleCreateTransaction()
    .setScheduledTransaction(trx)
    .setScheduleMemo("Please don't lose this pls")
    .setAdminKey(PrivateKey.fromString(acc2.privateKey))
    .setTransactionMemo('Desi batice')
    .execute(client);

  const scheduledReceipt = await scheduleTransaction.getReceipt(client);

  // Freeze the tx with the treasury client and sign it
  const transactionTreasury = await new ScheduleSignTransaction()
    .setScheduleId(scheduledReceipt.scheduleId)
    .freezeWith(treasuryClient)
    .sign(PrivateKey.fromString(acc1.privateKey));

  const submittedTreasury = await transactionTreasury.execute(treasuryClient);
  console.log(submittedTreasury)

  const transactionReceiver = await new ScheduleSignTransaction()
    .setScheduleId(scheduledReceipt.scheduleId)
    .freezeWith(receiverClient)
    .sign(PrivateKey.fromString(acc1.privateKey));

  const submittedReceiver = await transactionReceiver.execute(client);

  const receipt = await submittedReceiver.getReceipt(client)
  console.log(receipt)

}

await main();

process.exit(0)