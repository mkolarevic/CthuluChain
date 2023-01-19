import { AccountId, Hbar, TransferTransaction, Client } from "@hashgraph/sdk";
import { readFromFile } from "./account.js";

export async function multiSigTrx() {

  const accs = readFromFile(process.env.ACCOUNTS_FILE);


  console.log('MY ACCS: ', AccountId.fromString(accs[0].id))

  let acc1 = AccountId.fromString(accs[0].id);
  let acc2 = AccountId.fromString(accs[1].id);
  let acc3 = AccountId.fromString(accs[2].id);

  const client = Client.forName('testnet')
    .setOperator(accs[1].id, accs[1].privateKey);

  const trx = new TransferTransaction()
    .addHbarTransfer(acc1, new Hbar(-15))
    .addHbarTransfer(acc3, new Hbar(15))
    .setNodeAccountIds([acc1, acc2])
    .schedule()
    .freezeWith(client);


  // trx.sign(accs[1].privateKey);

  console.log(trx.getSignatures())
}