# MonadPay — Checkout Contract Design

**Project:** MonadPay (Quay-style merchant checkout on Monad)  
**Purpose:** Give each shop order a unique onchain identity, settle it once, and provide a verifiable receipt.  
**Hackathon target:** Monad Blitz Mumbai, 4 November 2026  
**Status as of 3 November:** Contract and test files created locally; dependencies installed. **Tests have not run successfully yet, and the contract has not been deployed.**

## 1. The idea in one minute

1. A shop generates a unique invoice for a customer's purchase.
2. The invoice is recorded in a smart contract **on Monad**.
3. The customer approves the configured stablecoin and pays through that contract.
4. The contract sends the stablecoin **directly to the merchant**.
5. The contract records who paid, when, and how much, and emits an event any explorer can verify.
6. Nobody can settle the same invoice twice.

This is the **onchain checkout core** of the larger Quay-style app. Later, the frontend can resolve an Indian shop's QR code and bring supported assets from other blockchains into Monad.

## 2. Exactly what is built

**File:** `src/MonadPayCheckout.sol`

| Contract feature | Behavior |
| --- | --- |
| `createInvoice(id, amount, expiresAt)` | Merchant creates one unique order with a fixed amount and deadline. |
| `payInvoice(id)` | Customer settles that order in the configured ERC-20 token. |
| `invoices(id)` | Anyone can inspect merchant, amount, deadline, customer address and settlement time. |
| `InvoiceCreated` event | Public record that an invoice exists. |
| `InvoicePaid` event | Public record that a particular invoice was settled. |
| Duplicate protection | The same invoice ID cannot be created or paid again. |
| Deadline protection | Expired invoices cannot be settled. |
| Failed transfer protection | If the token transfer fails, settlement state is rolled back automatically. |

The checkout contract does **not** temporarily hold customer funds. The token moves from customer to merchant inside the successful transaction.

**Scope limitation:** Any address can create its own invoice. Merchant verification or a QR-to-address directory is a separate feature, not included in this contract.

## 3. End-to-end customer journey

```text
Merchant creates order
         |
         v
Checkout contract records InvoiceCreated
         |
         v
App shows invoice / checkout QR
         |
         v
Customer chooses to complete the order
         |
         v
Customer approves the USDC amount
         |
         v
Customer calls payInvoice(invoiceId) on Monad
         |
         v
Contract checks: exists? unpaid? not expired?
         |
         v
USDC transfers directly to the merchant
         |
         v
Contract emits InvoicePaid
         |
         v
App shows transaction hash and receipt
```

For a hackathon, the strongest proof is a visible **real Monad transaction** invoking this contract, followed by an attempt to pay the same invoice again that fails.

## 4. What makes this a Monad application

The important operations happen inside **our own deployed contract on Monad**:

- An invoice is stored on Monad.
- The contract enforces single settlement and expiry.
- Stablecoin transfer occurs in the same successful onchain transaction.
- Anyone can verify the receipt in Monad's transaction logs.

Pyth, deBridge and Circle may be added later, but they are **supporting integrations**; the central business rule is ours.

The contract uses an immutable ERC-20 address, intended to be **native USDC on Monad** after the address has been verified against Circle's current documentation. It does not exchange tokens itself.

## 5. Examples and edge cases

**Success example:** A merchant creates order `M001` for 5 USDC. The customer approves 5 USDC, completes the order, and the merchant receives 5 USDC. The onchain event references `M001`.

**Duplicate example:** The customer tries to complete `M001` again. The contract rejects it. A second shopper cannot use the same already-paid order either.

**Expiry example:** An order's expiry passes before checkout. The contract rejects the later attempt.

**Insufficient approval or balance:** The transfer fails. The contract leaves the invoice unpaid rather than issuing a false receipt.

**Multiple orders:** `M001` and `M002` are independent when assigned distinct IDs.

**Important:** An event is a blockchain receipt, **not** an automatically generated tax invoice or proof of INR delivery.

## 6. How cross-chain checkout will fit later

The larger MonadPay app can accept a supported token on another chain and arrange for the shop to receive USDC **on Monad**.

```text
Customer asset on source chain
         |
         v
deBridge / CCTP / routing integration
         |
         v
USDC arrives on Monad
         |
         v
Customer or a secure destination executor
calls the checkout contract
         |
         v
Invoice is marked paid and merchant receives USDC
```

**Crucial:** Bridging tokens to a wallet or even to a contract address does **not** automatically settle an invoice. A later version needs a carefully designed destination call and verification mechanism or a separate customer action. Cross-chain operations are generally **not atomic across both networks**.

Pyth can help display a reference price and compare it to the actual route quote. Pyth does not perform swaps or transfers.

## 7. India-specific merchant flow

An Indian UPI QR code typically points to UPI payment identifiers, **not a Monad address**. For a future real app, a shop must register its UPI identifier or QR identity against its own receiving address in MonadPay.

For this prototype, use a known demonstration merchant and complete checkout **onchain in a stablecoin**. Do not claim the shop has received INR in its bank account: that would need separate, compliant off-ramp infrastructure.

## 8. Files created

| File | Role |
| --- | --- |
| `src/MonadPayCheckout.sol` | Core checkout Solidity contract |
| `test/MockUSDC.sol` | Fake token for local tests only |
| `test/checkout.test.mjs` | Automated invoice, settlement and failure tests |
| `scripts/compile.mjs` | Compiles contract and generates ABI/bytecode |
| `scripts/deploy.mjs` | Deploys to the selected Monad network once configured |
| `README.md` | Setup, run and demonstration instructions |
| `package.json` | Dependencies and npm commands |

The planned automated tests cover creation, exact merchant transfer, receipt logs, duplicate orders, double settlement, expiry, invalid orders, missing approval, insufficient funds and independent orders.

**Verification status:** `npm install` succeeded (354 packages). The test command was interrupted **before execution**. This document is not a claim that the tests passed.

## 9. Hackathon acceptance checklist

- [x] Write a custom Monad checkout contract
- [x] Make invoice IDs unique and reject repeated settlement
- [x] Emit events for invoice creation and completion
- [x] Write automated tests for expected behavior and failure cases
- [x] Prepare deployment script
- [x] Install project dependencies
- [ ] Run compiler and automated tests successfully
- [ ] Review and resolve any failures
- [ ] Deploy contract to Monad testnet, record address and deployment transaction
- [ ] Complete a checkout with a supported test asset and verify the explorer receipt
- [ ] Demonstrate a duplicate checkout failure
- [ ] Deploy and show a real Monad mainnet checkout if needed and approved for judging

## 10. What is deliberately not included yet

- Merchant account verification or a merchant registry
- UPI integration or automatic INR payouts
- Merchant-issued shop tokens
- Token swaps, price oracle integration, or cross-chain bridging
- Refunds, cancellations or disputes
- A QR scanner or polished customer-facing frontend
- A formal security audit

Those are separate tasks, not part of the **Checkout** feature just accepted.

## 11. Immediate next step

Run `npm test` inside `D:\\projects\\experiments\\monadpay-checkout`, fix any failures, then proceed to a controlled Monad deployment and an explorer-verified demo. Do **not** claim the hackathon's onchain requirement has been met until the real deployment and transaction are visible.

---

**References**

- Monad developer resources: https://github.com/monad-developers
- Circle's native USDC/CCTP on Monad: https://www.circle.com/blog/now-available-usdc-cctp-wallets-and-contracts-on-monad
- deBridge Monad support: https://debridge.com/learn/blog/monad-is-live-on-debridge/
- Quay reference product: https://www.quay.cash/
