import { AccountId, Hbar, TransferTransaction, Client, PrivateKey } from "@hashgraph/sdk";
import { readFromFile } from "./account.js";

export async function multiSigTrx() {

  const accs = readFromFile(process.env.ACCOUNTS_FILE);

  let acc1 = accs[0];
  let acc2 = accs[1];
  let acc3 = accs[2];

  const client = Client.forName('testnet')
    .setOperator(acc2.id, acc2.privateKey);

  const trx = new TransferTransaction()
    .addHbarTransfer(acc1.id, -15)
    .addHbarTransfer(acc3.id, 15)
    .setNodeAccountIds([AccountId.fromString(acc1.id), AccountId.fromString(acc2.id)])
    .freezeWith(client);

  console.log(trx.getSignatures())

  await trx.sign(PrivateKey.fromString(acc2.privateKey));

  console.log(trx.getSignatures().__map)
  console.log('SIGNATURES ACC 1', trx.getSignatures().__map[AccountId.fromString(acc1.id)])
  console.log('SIGNATURES ACC 2', trx.getSignatures().__map[AccountId.fromString(acc2.id)])
}

await multiSigTrx();

process.exit(0)