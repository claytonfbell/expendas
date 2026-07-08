# Expendas Assets

- Add new table Asset that can belong to investment accounts.

## Asset

- id
- accountId
- ticker
- tickerPrice (this is the ticker price used when the shares was last calculated and updated)
- shares (fractional number of shares)
- assetType (enum) Equity, Fixed Income

On the accounts page, we can open a dialog to manage assets in investment accounts.

## Assets Dialog

- In the dialog, we can add, edit, and remove assets for the selected investment account.
- When we edit an asset, we update the current balance, and the server will recalculate the shares and the account balance based on the updated assets.
- We enter Ticker and current balance. On the server the fractional number of shares is stored along with the current ticker price so that the value of the asset can be calculated and returned to the front-end.
- Whenever investment account assets update, we should recalculate the account balance on the server so that the front-end receives the correct updated balances.

On the investments page we can also open the asset dialog for investment accounts to manage the assets for a particular account. The account.balance is no longer directly editable since it gets calculated on the server when assets are updated.

The columns account.tickerPrice, account.totalFixedIncome, account.fixedIncomeTickerPrice, should be removed.

- Any code that references the removed columns should be updated to use the Asset table to calculate account balances instead. The calculations should be server-side so that the front-end receives the correct account balances without needing to perform the calculations itself.

- The front-end should not attempt to calculate account balances itself, but should rely on the server to return the correct balances based on the Asset table.

## balance history

The column accountBalanceHistory.fixedIncome should be removed.

The market high/low columns will be calculated server-side using the asset table and finding the market 2-year hight and low values for ticker prices for the assets.
