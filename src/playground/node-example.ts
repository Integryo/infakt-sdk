import { InfaktSDK } from '../api'

async function main() {
  const inpostSDK = InfaktSDK.init({
    apiKey: 'c383cd0140652815f918cac15bb68f38683bf870',
  })

  const invoices = await inpostSDK.get.invoices()
  console.info('invoices', invoices.entities)
}

main()
