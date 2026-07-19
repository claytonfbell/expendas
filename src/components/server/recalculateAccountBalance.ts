import prisma from "./prisma"

export async function recalculateAccountBalance(accountId: number) {
  const assets = await prisma.asset.findMany({
    where: { accountId },
  })

  const balance = assets.reduce((sum, asset) => sum + asset.balance, 0)

  await prisma.account.update({
    where: { id: accountId },
    data: { balance },
  })

  return balance
}
