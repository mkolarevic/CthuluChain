import { readFromFile } from './account'

async function main() {
  const accs = readFromFile(process.env.ACCOUNTS_FILE)
  console.log(accs)
}

await main()

process.exit(0)
