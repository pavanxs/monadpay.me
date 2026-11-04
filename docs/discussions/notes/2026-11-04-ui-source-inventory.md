# MonadPay UI source inventory

Date: 4 November 2026.
Session: 98623; audit agent: checkout_ccip_audit.

## Confirmed task and boundaries

- The user supplied a friend's repository and requested the actual interface source copied into the main app, preserving the interfaces as-is.
- This is a source import, with no redesign or replacement screen implementation.
- This audit owns only this note. The implementation agent owns the frontend import and any necessary runtime/configuration adaptation.
- Existing checkout contracts, project notes, and other agents' work must be preserved.

## Pinned source

- Source: user-provided frontend repository.
- Branch: `main`.
- Reviewed commit: `1c2d3dc4685293645cca4cb652b10439738c5559`.
- Source clone: `D:\projects\experiments\monadpay-friend-source-2026-11-04`.
- Target: `D:\projects\experiments\monadpay.me`.
- The GitHub tree contains 35 tracked files, including 25 files under `src/`.
- The source clone was clean at the reviewed commit.
- GitHub's declared homepage is https://monad-pay-eta.vercel.app; this audit did not inspect that deployment in a browser.

## Framework and package facts

The original source uses Next.js App Router, React, TypeScript, and Tailwind 4 with substantial custom CSS. The package requests Next `^16.4.5`, React/React DOM `^19.0.0`, TypeScript `^5.9.0`, and Node `>=20.9`. A `pnpm-lock.yaml` is present.

The source package's production dependencies are only Next, React, and React DOM. No wallet/auth/routing SDK is declared. Its original dev/start scripts use POSIX `${PORT:-3000}` syntax; the implementation owner may adapt those scripts for Windows while preserving screen files.

Root layout loads Inter through `next/font/google`, with weights 400, 500, 600, and 700. The font and its CSS variable are part of the original presentation. Font retrieval/build behavior needs runtime verification by the implementation owner.

## Original routes and interfaces

| Route / source | Included interfaces |
| --- | --- |
| `/` — `src/app/page.tsx` | Landing navigation, hero/phone mockup, three-step explanation, asset cards, merchant callout, final CTA, and footer |
| `/app` — `src/features/user/UserApp.tsx` | Email/MetaMask welcome flow; home, activity, wallet, settings; receipt drawers |
| Customer payment flow | Scan, resolve, amount, crypto, review, authorize, processing, and success states |
| `/merchant` — `src/features/merchant/MerchantApp.tsx` | Four-step onboarding; overview, payments, profile, identity, wallet, settings; payment receipts |
| Shared app files | Route layouts, error/global-error/not-found screens, metadata, robots, sitemap, and favicon |

Most customer and merchant sub-screens are React state changes within `/app` or `/merchant`, rather than separate URL routes. Preserve their original state transitions and default demo values.

## Styles, assets, and mobile behavior

- Preserve `src/app/globals.css`, `src/styles/merchant.css`, and `src/styles/user.css` in full.
- The customer route layout imports both merchant and user CSS; the shared `mp-*` styling comes from merchant CSS.
- The original visual system uses Inter, light neutral/lavender surfaces, purple accents, dark purple/text, rounded cards, and the existing spacing/shadows.
- Key global tokens include `--purple: #7048cf`, `--violet: #8b63e8`, `--deep: #1d1235`, and `--muted: #716c7a`. The body background is `#fbfaff`.
- The landing stylesheet has breakpoints at 1050, 820, and 560 pixels. Dashboard styles include 1100, 820, and 600 pixels, mobile navigation/sheets, and safe-area padding.
- Preserve the existing viewport configuration, mobile menu, scroll-reveal behavior, and reduced-motion CSS.
- Visual assets are the original inline SVG/CSS components plus `src/app/icon.svg`; there is no tracked `public/` asset directory.
- `src/components/ui/crypto-icons.tsx` contains vendored Web3Icons artwork and its attribution comment. Preserve it with the source.

## Implemented demo behavior versus live integrations

The copied interfaces are interactive demos:

- Customer email flow checks the email format and accepts any six-character code before a timer completes. It does not verify an OTP with an auth provider.
- MetaMask connection is simulated with a timer and a fixed address. Merchant authentication behaves similarly.
- Customer `simulateScan()` resolves the fixed sample UPI identifier. Uploading a QR invokes that simulation; it does not decode the image or use the phone camera.
- Merchant image upload previews the image, then a timer assigns a fixed UPI identifier.
- Merchant lookup, assets, balances, fees, and quotes come from source constants. The example INR/USDC ratio is a hardcoded demo value.
- Payment completion advances through timers and creates a synthetic receipt/transaction hash. It does not submit a blockchain transaction.
- `PseudoQr` and the merchant QR visual are decorative demo renderings.
- The reviewed auth/scan/payment handlers contain no live wallet-provider, routing, camera-decoding, or checkout-contract calls. Clipboard/file-preview/navigation interactions are real browser UI operations.
- Source copy talks about USDC settlement. Importing it does not implement the project's additional EUR/GBP/JPY targets or live social sign-in.

These findings describe the original code. No screen labels, demo values, or handlers were changed by this audit.

## Exact-copy verification

After the implementation agent reported that the import was complete, this audit independently compared every tracked `src/` file in the source clone to the corresponding target file.

**Result: 25/25 files matched byte for byte. No missing files, differing files, or extra target `src/` files were found.**

The following SHA-256 values were equal in the two working directories at verification time. The source clone uses its checked-out Windows line endings; these are raw working-file hashes rather than canonical Git blob hashes.

| Source / target path | Matching SHA-256 |
| --- | --- |
| `src/app/app/layout.tsx` | `d5a32d41678d6a1c781a4d72e18d823827a682ed6e9903ba5af809f517c9d315` |
| `src/app/app/page.tsx` | `4d7181012d49bba4cefee9d98728b62ecc1d7ec88bb7d85e73052727d7e366d2` |
| `src/app/error.tsx` | `ed53b21cc5d4fddda16b681396d6678e3dddf125390daa141df3bc4bfd90e407` |
| `src/app/global-error.tsx` | `20b0ab0edd055ee67119d7ab9320e49615514fea3951cbad6e9cf857993fb1f9` |
| `src/app/globals.css` | `9b942076b5f8d0d17a8867a7a309e66a4283c770c8c636bfe0413d6e961ec6b7` |
| `src/app/icon.svg` | `1d43020da83c76ab839359b890dac522fdbd155e90e9061e0f17f57f9226dd77` |
| `src/app/layout.tsx` | `0661e35965b3853306fa95afb7146da467071bcb66e24bfb506c765f174f5f87` |
| `src/app/merchant/layout.tsx` | `966b53723df6dc750055b2d3c6af021e5eef7f2995a8196a68edbdc1d8ef1de0` |
| `src/app/merchant/page.tsx` | `ae917cca4988f87868a8b00f354690cd84be05ec9d3ba2b2c25966140e35b40a` |
| `src/app/not-found.tsx` | `3cab9e8d42445063d028c26b96457df307e77191a654b4ee468238bcabda5455` |
| `src/app/page.tsx` | `60c37a3c8f03451b47a4d5a30fbe96a8fb314263e737a48bf0c00e4061127cbd` |
| `src/app/robots.ts` | `2f024450b302738f46dea38abc73191db2799f366fa6f104b7bbe74bca2696d5` |
| `src/app/sitemap.ts` | `7a677eacc2093ef8501d02d2ce61a44072f48a52980ce3358db51656697fa3fd` |
| `src/components/landing/Button.tsx` | `1cf9eff217f99ab1008282d2121aa64301b1da254e6500882068fb1269e4724e` |
| `src/components/landing/Logo.tsx` | `fa7d01aac0726a855e21eb676763b013e492e2858eb92a7b896481a8315fe325` |
| `src/components/landing/MobileMenu.tsx` | `54761eeecdb40af2b1c730ee0385a88f997b93b2050efd841ff79553c3c6b09f` |
| `src/components/landing/PhoneMockup.tsx` | `1b3cf7a19fc99088f0b6b51e3597c4a4ff7e3cbbed990e99caae7f89b80a300b` |
| `src/components/landing/ScrollReveal.tsx` | `a23674326511641b1063d83d7d108161579252c493145b545de3669af6bca320` |
| `src/components/landing/icons.tsx` | `e798e5070e9cfb8f638c8861e55b8b9ab90a8dde84dd17c7b2b3578866dd7b03` |
| `src/components/ui/crypto-icons.tsx` | `2ca485b74443dec6af93922be8f06462df5370f209b2cd459f5a979bfe4af0b7` |
| `src/features/merchant/MerchantApp.tsx` | `2f05591586e3fd3e635a196812c6d6c53e1fdab9f04cc0851ae08a0d8c18832c` |
| `src/features/user/UserApp.tsx` | `531e7e849870a80df4dcecf13dd6476ff708d72eb7a8a6214c9662a2f35ad5dd` |
| `src/lib/site.ts` | `6dcbf7f764d4d5d767c9cb874c884136836c62152a986afec24bbbba3dc9fc0e` |
| `src/styles/merchant.css` | `dccc83109f374d3939cf389a836249d7f18f2f8bc5a76f588187c79dd7674cb2` |
| `src/styles/user.css` | `9b447f8c24d3df0f481317497980d420ff610d4fcb818d98fa6d239111370ee7` |

## Completion checklist and remaining verification

- [x] Pin and verify the original repository commit.
- [x] Inventory the original screens, routes, styles, fonts, icons, and dependencies.
- [x] Independently verify literal reuse of all 25 `src/` files.
- [x] Separate source demo behavior from unimplemented live integrations.
- [ ] Implementation owner to report dependency install, typecheck, lint, and build outcomes.
- [ ] Verify the imported routes in a browser at consistent desktop and phone viewport sizes.
- [ ] Verify mobile menu, dashboard navigation, onboarding, receipt drawers, and payment-demo states without changing the original UI.

This audit did not run the app, install dependencies, run frontend tests/builds, deploy, modify frontend source, or change Git configuration. CodeHands `rg` was unavailable, so read-only Node file inspection was used after that failed lookup.

## Sources and changed files

Sources: the pinned GitHub tree/package, the clean source clone, `src/app/layout.tsx`, both feature files, route layouts, the three stylesheets, shared icon/landing components, `next.config.ts`, and `src/lib/site.ts`.

Project context reviewed first: root `AGENTS.md`, root `README.md`, `docs/discussions/PROJECT_CONTEXT.md`, `docs/discussions/README.md`, and both existing setup/merchant-directory notes. No old session transcripts were accessed.

Only file created by this audit: `docs/discussions/notes/2026-11-04-ui-source-inventory.md`.
