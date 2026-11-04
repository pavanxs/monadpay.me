# MonadPay: shared project context

Updated: 4 November 2026.

## Confirmed product

MonadPay (`monadpay.me`) is Quay-style merchant QR checkout on Monad, adapted to the Indian merchant context.

Intended flow:
1. A registered shop links its QR identity to its Monad receiving address.
2. The customer scans the shop's QR and chooses a supported crypto asset and source chain.
3. The app shows an executable quote and the customer confirms.
4. Routing and conversion deliver the shop's chosen currency-denominated token on Monad.
5. Our Monad checkout contract settles a unique invoice, prevents duplicate settlement, and emits a verifiable receipt.

The four target denominations are **USD, EUR, GBP, and JPY**. USDC, EURm, GBPm, and JPYm are candidate settlement assets; this does not claim that all token routes are implemented or verified. SGD is outside the initial four.

The user wants a live phone demonstration scanning a QR shown on another device. The product focus remains checkout; loyalty passes and shop-token ideas were not selected.

## Confirmed web and sign-in choices

- Mobile-first **Next.js + TypeScript** website.
- Frontend hosting on **Vercel**.
- Both existing-wallet connection and email/social login with an in-app wallet are required planned sign-in methods.
- An authentication/embedded-wallet provider has not been selected.
- Vercel hosts the web app; the Solidity contracts deploy separately to Monad.

## Current repository and implementation

- Canonical repository: https://github.com/pavanxs/monadpay.me
- Local project: `D:\projects\experiments\monadpay.me`.
- Existing checkout foundation is copied into `contracts/checkout/`; the original sibling `monadpay-checkout` remains intact.
- The contract currently uses one immutable settlement token. It creates invoices, checks expiry and duplicate state, transfers the exact configured token amount directly to the merchant, and records receipt events.
- Compilation and all **11 existing contract tests passed on 4 November 2026**.
- Working local dependency setup: `npm install --ignore-scripts` in `contracts/checkout`.
- The existing Ganache lockfile has an `npm ci`/macOS-only `fsevents` issue on Windows. The fallback installation passed without changing the lockfile.
- No frontend, QR scanner, merchant onboarding, cross-chain integration, or four-currency conversion has been implemented in this repository yet.
- No deployment address or completed onchain demo has been verified in this session.
- All 10 MONSKILLS folders are installed under `.agents/skills/`, passed validation, and were saved to GitHub in commit `b7f297e5ec162caebee8df58f7ece6650e42c9d1`.

## Routing discussion

LI.FI, deBridge, Circle CCTP, and Chainlink CCIP have been discussed. The final integration choice is still open.

CCIP discussion in session 98623 is **research only**. Do not turn this research into an integration task without a user instruction. Another session may receive its own explicit implementation task.

Accepting multiple settlement-token addresses in invoices and supplying real conversion routes into those assets are separate implementation steps. Only working, supported routes should be presented as available.

## Open questions

1. Merchant onboarding: should shop owners create their own profiles, or should the team configure the initial demo shops?
2. Which provider should support email/social sign-in and in-app wallets?
3. Which routing provider and first chain/token route should be implemented?
4. Which live conversion routes are available for the four target denominations?

## Sources for this context

- User decisions in the current CodeHands session, 98623.
- Planning transcript 35921 and follow-up transcript 60421, personally reviewed by the coordinating agent.
- `contracts/checkout/src/MonadPayCheckout.sol`.
- `contracts/checkout/docs/checkout-design.md` (historical design snapshot; its original testing status predates the verified test run above).
- `contracts/checkout/package.json` and `contracts/checkout/test/checkout.test.mjs`.

Record new findings in your own session note. Preserve the difference between user-approved goals, completed code, tested behavior, and proposed work.
