import { Client, PrivateKey } from '@hashgraph/sdk'
import { createAccount, readFromFile, transferFunds } from './account.js'
import dotenv from 'dotenv'
import { processScheduled, scheduledTransaction } from './scheduled.js';

import { mintNft, createNft } from './nft.js';
dotenv.config()

async function _fund(accountId, accountList) {
  const shouldFund = process.env.SHOULD_FUND;
  if (shouldFund && `${shouldFund}` !== '0') {
    for await (const account of accountList) {
      await transferFunds({
        from: accountId,
        to: account.id,
        privateKey: account.privateKey,
        amount: 1000
      })
    }
  }
}

async function _nft(accountList) {
  const treasuryAccount = {
    id: accountList[0].id,
    privateKey: PrivateKey.fromString(accountList[0].privateKey)
  }

  const supplyKey = PrivateKey.generate();

  const tokenId = await createNft({
    name: 'Worship Token',
    symbol: 'CTH',
    decimals: 0,
    supply: 0,
    maxSupply: 5,
    treasuryId: treasuryAccount.id,
    treasuryPk: treasuryAccount.privateKey,
    supplyKey,
    feeCollectorAccountId: accountList[1].id,
    fallbackFee: 2
  })

  const mintedNfts = await mintNft(tokenId, supplyKey, 5, treasuryAccount.id, treasuryAccount.privateKey)

  console.log({ mintedNfts, supplyKey: supplyKey.toStringRaw() })
  return mintedNfts;
}

async function main() {
  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;
  const filePath = process.env.ACCOUNTS_FILE;

  if (!accountId || !privateKey) {
    throw new Error('Account ID or Private Key missing!')
  }

  const client = Client.forName('testnet');
  client.setOperator(accountId, privateKey);

  // get the list of existing accounts
  let accountList = readFromFile(filePath);

  if (!accountList.length) {
    for (let index = 0; index < 5; index++) {
      accountList.push(await createAccount(client))
    }
  }

  // Fund accounts if necessary
  process.env.RUN_FUND == '1' && await _fund(accountId, accountList);

  // Generate NFTs
  process.env.RUN_NFT == '1' && await _nft(accountList);

  //await multiSigTrx()

  /* const serialized = await scheduledTransaction();

  await processScheduled(serialized) */

  process.exit(0)
}

main()
