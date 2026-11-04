# MonadPay

**Merchant QR checkout with settlement and verifiable receipts on Monad.**

- **Project domain:** `monadpay.me`
- **Repository:** [pavanxs/monadpay.me](https://github.com/pavanxs/monadpay.me)
- **Frontend:** Mobile-first Next.js + TypeScript website (planned)
- **Frontend hosting:** Vercel
- **Settlement network:** Monad
- **Stage:** Hackathon prototype; the invoice core exists, while the customer-facing app is planned.

## What we are building

MonadPay is a Quay-style merchant checkout project adapted to India. The intended experience lets a customer scan a registered shop's existing QR code, choose a supported crypto asset and source chain, review a quote, and confirm the purchase.

The shop chooses its target settlement denomination. Routing and swaps bring the required value to Monad, where our own checkout contract settles a unique invoice and records a receipt.

A merchant registry must link each shop's QR identifier to its receiving address and settings. The initial demo targets onchain settlement; bank payouts and automatic INR delivery are outside the current build.

## Intended checkout flow

1. The shop registers its existing QR identifier, Monad receiving address, and preferred settlement denomination.
2. The merchant creates a unique invoice for the purchase.
3. The customer scans the shop's QR using a phone and opens the matching checkout.
4. The customer connects an existing wallet or signs in with email/social login and an in-app wallet.
5. The customer chooses a supported input asset and source chain.
6. MonadPay shows the route, expected settlement amount, and fees before confirmation.
7. The customer confirms; the selected route brings the accepted settlement asset to Monad.
8. The checkout contract validates and settles the invoice once, transfers value to the merchant, and records an onchain receipt.

The QR scanner, wallet access, merchant lookup, quote screen, routing, and connected customer journey still need to be built.

## Initial target denominations

| Merchant denomination | Proposed token candidate |
| --- | --- |
| USD | USDC |
| EUR | EURm |
| GBP | GBPm |
| JPY | JPYm |

These are product targets, not a list of live supported assets. Each candidate needs a verified token address, available route, usable liquidity, and a tested settlement path before it appears as supported in the app. The existing contract accepts one configured token per deployment.

SGD is a possible later addition, outside the initial four denominations.

## Architecture

| Part | Responsibility | Current state |
| --- | --- | --- |
| Web app on Vercel | Phone QR scanning, quotes, confirmation, and receipt display | Mobile-first Next.js + TypeScript selected; app scaffold pending |
| Accounts and wallets | Connect an existing wallet, or email/social login with an in-app wallet | Both are required planned features; auth provider not selected |
| Merchant directory | Resolve registered shop QR identifiers to receiving addresses and preferences | Planned; onboarding approach still open |
| Quote and routing layer | Find supported source assets/chains and arrange any required swaps and transfers | Planned; provider not finalized |
| Checkout contract on Monad | Validate invoices, enforce single settlement, transfer the configured token, and emit receipt events | Existing single-token core |
| RPC and explorer integration | Read invoice state and verify transactions and receipts | Frontend integration pending |

Vercel will host the web app. Solidity contracts are deployed separately to Monad.

LI.FI and deBridge are routing candidates under evaluation. CCIP has been researched; no CCIP integration is included in this implementation.

## What exists today

The checkout foundation lives in [`contracts/checkout`](contracts/checkout). It includes Solidity source, deployment and compilation scripts, behavior tests, and the original design notes.

The current contract supports:

- Merchant-created invoices with a unique ID, fixed amount, and expiry.
- Checks that an invoice exists, remains unpaid, and has not expired.
- Direct transfer of the configured ERC-20 token from the customer to the merchant.
- Duplicate-settlement protection and rollback if the token transfer fails.
- Public invoice state plus `InvoiceCreated` and `InvoicePaid` events.

This core expects the customer to transact on Monad. Cross-chain arrival, swaps, additional settlement assets, recovery flows, and the phone checkout interface are separate work.

| Verification item | Status |
| --- | --- |
| Contract and scripts | Present |
| Automated behavior tests | Passed 11/11 locally on 4 November 2026 |
| Monad contract deployment | Script present; verified address and transaction pending |
| Live phone QR demo | Pending |
| Vercel frontend deployment | Pending |

## Project layout

| Path | Contents |
| --- | --- |
| `contracts/checkout/src/MonadPayCheckout.sol` | Invoice and settlement contract |
| `contracts/checkout/test/` | Mock token and checkout behavior tests |
| `contracts/checkout/scripts/` | Compile and deployment scripts |
| `contracts/checkout/docs/checkout-design.md` | Existing checkout design and scope |
| `contracts/checkout/package.json` | Core package dependencies and commands |
| `.agents/skills/` | Project-local Monad development guidance |
| `skills-lock.json` | Installed skill source lock |

A frontend directory and root web-app package will be added when the Next.js app is scaffolded.

## Run the checkout core locally

Requires Node.js 20 or newer. From the repository root:

```sh
cd contracts/checkout
npm install --ignore-scripts
npm test
```

`npm test` compiles the contracts with solc and runs the behavior tests in an in-memory Ganache EVM. The current suite passed all 11 tests; this is local verification, not a Monad deployment.

Use the install command above on Windows. The inherited lockfile currently causes `npm ci` to fail on Ganache's macOS-only `fsevents` entry.

| Command | Purpose |
| --- | --- |
| `npm run compile` | Generate contract ABI and bytecode |
| `npm test` | Compile and run the checkout tests |
| `npm run deploy` | Run the configured Monad deployment script |

## Deploy the contracts

The existing deployment script reads `MONAD_RPC_URL`, `MONAD_USDC_ADDRESS`, and `MONAD_DEPLOYER_KEY` from the local environment. Configure a chosen Monad network, a verified settlement-token address, and a funded deployment signer before running `npm run deploy` inside `contracts/checkout`.

The script checks the network and token contract, then prints the deployment transaction and contract address. Record those verified results before connecting the frontend. Keep the deployment key out of Git and browser code.

No deployed contract address is claimed by this README.

## Deploy the frontend to Vercel

Vercel is the selected host for the mobile-first Next.js + TypeScript website. The app has not been scaffolded yet; its root directory, build command, and output settings will be documented from the actual app setup.

Once the frontend exists:

1. Connect this GitHub repository to a Vercel project.
2. Select Vercel's Next.js framework preset and set the actual frontend root and build settings.
3. Configure public network settings and verified contract addresses.
4. Test the HTTPS preview on a real phone, including camera access and wallet confirmation.
5. Connect `monadpay.me` after the checkout works end to end.

Frontend deployment does not deploy or upgrade the Monad contracts.

## Live demo checklist

- [x] Compile the checkout core and pass all 11 behavior tests.
- [ ] Deploy the contract to the selected Monad network and record its address.
- [ ] Register a demonstration merchant and map its existing QR identifier.
- [ ] Scan the QR with a real phone and display the correct merchant and invoice.
- [ ] Show a valid quote for one explicitly supported asset/chain route.
- [ ] Confirm checkout and show the merchant's settlement and onchain receipt.
- [ ] Demonstrate that a paid invoice cannot be settled twice.
- [ ] Demonstrate expiry handling and a clear outcome for unsupported or failed routes.
- [ ] Verify the full customer flow through the Vercel-hosted app.

Additional input assets, source chains, and currency paths should be enabled only after their routes and settlement behavior have been tested.

## Shared project notes

- [Project context](docs/discussions/PROJECT_CONTEXT.md): agreed scope, implementation status, and open decisions.
- [Discussion notes](docs/discussions/README.md): shared records of product and technical discussions.
