const {
  Client,
  ContractFunctionParameters,
  ContractCallQuery,
  Hbar,
  PrivateKey,
} = require("@hashgraph/sdk");
require('dotenv').config();

const myAccountId = process.env.F_ACC_ID;
const myPrivateKey = PrivateKey.fromString(process.env.F_PRIVATE_KEY);
const contractId = process.env.CONTRACT_ID;
const hash = process.env.HASH;

// If we weren't able to grab it, we should throw a new error
if (myAccountId == null ||
  myPrivateKey == null) {
  throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {

  //Query the contract for the contract message
  const contractCallQuery = new ContractCallQuery()
      //Set the ID of the contract to query
      .setContractId(contractId)
      //Set the gas to execute the contract call
      .setGas(100000)
      //Set the contract function to call
      .setFunction("function1", new ContractFunctionParameters().addUint16(2).addUint16(2))
      //Set the query payment for the node returning the request
      //This value must cover the cost of the request otherwise will fail
      .setQueryPayment(new Hbar(10));

  //Submit the transaction to a Hedera network
  const contractQuerySubmit = await contractCallQuery.execute(client);
  const contractQueryResult = contractQuerySubmit.getUint32();

  //Log the updated message to the console
  console.log("The updated (1) contract message: " + contractQueryResult);

  const inputToFunction2 = contractQueryResult;

  //Query the contract for the contract message
  const contractCallQuerySec = new ContractCallQuery()
    //Set the ID of the contract to query
    .setContractId(contractId)
    //Set the gas to execute the contract call
    .setGas(100000)
    //Set the contract function to call
    .setFunction("function2", new ContractFunctionParameters().addUint32(inputToFunction2))
    //Set the query payment for the node returning the request
    //This value must cover the cost of the request otherwise will fail
    .setQueryPayment(new Hbar(10));
  

  //Submit the transaction to a Hedera network
  const contractQuerySubmit2 = await contractCallQuerySec.execute(client);
  const contractQueryResult2 = contractQuerySubmit2.getUint64();

  //Log the updated message to the console
  console.log("The updated (2) contract message: " + contractQueryResult2);

  process.exit();
}

main();