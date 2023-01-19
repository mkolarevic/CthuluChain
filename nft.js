
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  CustomRoyaltyFee,
  CustomFixedFee,
  Hbar,
} from "@hashgraph/sdk";
import dotenv from 'dotenv'
dotenv.config()

/**
 * Creates an NFT
 *
 * @export
 * @param {Object} NftData Object containing all data required to create an NFT
 * @param {string} [NftData.name = 'Worship Token'] Token name
 * @param {string} [NftData.symbol = 'CTH'] Token symbol for identification
 * @param {number} [NftData.decimals = 0] Decimals for the given token
 * @param {number} [NftData.supply = 0] Initial token supply
 * @param {number} [NftData.maxSupply = 5] Maximum supply for the token
 * @param {string} NftData.treasuryId
 * @param {string} NftData.treasuryPk
 * @param {string} NftData.supplyKey
 * @param {string} NftData.feeCollectorAccountId
 * @param {number} [NftData.fallbackFee = 200] Fallback transaction fee
 * 
 * @typedef {Object} transactionData
 * @property {Object} transaction
 * @property {Object} receipt
 * @property {string} tokenId
 * @return {Promise<transactionData>} Object containing the transaction, receipt and tokenId
 */
export async function createNft({
  name = 'Worship Token',
  symbol = 'CTH',
  decimals = 0,
  supply = 0,
  maxSupply = 5,
  treasuryId,
  treasuryPk,
  supplyKey,
  feeCollectorAccountId,
  fallbackFee = 200
}) {
  const client = Client.forName('testnet');
  client.setOperator(treasuryId, treasuryPk);

  const customFee = new CustomRoyaltyFee({
    numerator: 10,
    denominator: 100,
    feeCollectorAccountId,
    fallbackFee: new CustomFixedFee().setHbarAmount(new Hbar(fallbackFee))
  })
  //Create the NFT
  let nftCreate = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(decimals)
    .setInitialSupply(supply)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(maxSupply)
    .setSupplyKey(supplyKey)
    .setCustomFees([customFee])
    .freezeWith(client);

  //Sign the transaction with the treasury key
  let nftCreateTxSign = await nftCreate.sign(treasuryPk);

  //Submit the transaction to a Hedera network
  let nftCreateSubmit = await nftCreateTxSign.execute(client);

  //Get the transaction receipt
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);

  //Get the token ID
  let tokenId = nftCreateRx.tokenId;

  //Log the token ID
  console.log(`- Created NFT with Token ID: ${tokenId} \n`);

  return {
    transaction: nftCreateSubmit,
    receipt: nftCreateRx,
    tokenId
  }
}

/**
 * Mint an NFT
 *
 * @export
 * @param {string} tokenId Token ID
 * @param {string} supplyKey Supply key
 * @param {number} [amount=1] Amount to print
 * 
 * @typedef {Object} mintedNfts
 * @property {Array} mintTx
 * @property {Array} mintTxSign
 * @property {Array} mintTxSubmit
 * @property {Array} mintRx
 * @return {Promise<mintedNfts>} 
 */
export async function mintNft(tokenId, supplyKey, amount = 1, treasuryId, treasuryPk) {
  const client = Client.forName('testnet');
  client.setOperator(treasuryId, treasuryPk);

  const returnData = [];

  for await (const iterator of Array.apply(null, Array(amount)).map((x, i) => i)) {
    const data = {
      mintTx: null,
      mintTxSign: null,
      mintTxSubmit: null,
      mintRx: null
    }
    // Mint new NFT
    data.mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([Buffer.from([`NFT ${iterator}`])])
      .freezeWith(client)

    //Sign the transaction with the supply key
    data.mintTxSign = await data.mintTx.sign(supplyKey);

    //Submit the transaction to a Hedera network
    data.mintTxSubmit = await data.mintTxSign.execute(client);

    //Get the transaction receipt
    data.mintRx = await data.mintTxSubmit.getReceipt(client);

    //Log the serial number
    console.log(`- Created NFT ${tokenId} with serial: ${data.mintRx.serials[0].low} \n`);
    returnData.push(data)
  }

  return returnData
}