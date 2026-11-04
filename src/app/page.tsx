import Link from "next/link"
import { Button } from "@/components/landing/Button"
import { ArrowUpRight, Check, ScanIcon, SettleIcon, WalletIcon } from "@/components/landing/icons"
import { Logo } from "@/components/landing/Logo"
import { MobileMenu } from "@/components/landing/MobileMenu"
import { PhoneMockup } from "@/components/landing/PhoneMockup"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import {
  ChainIcon,
  TokenChainIcon,
  type ChainId,
  type TokenSymbol,
} from "@/components/ui/crypto-icons"

const steps = [
  {
    number: "01",
    title: "Scan the merchant QR",
    body: "We identify the merchant through their QR payment identity, linked to their Monad wallet on MonadPay.",
    icon: <ScanIcon />,
  },
  {
    number: "02",
    title: "Choose your crypto",
    body: "Pay with your preferred token from supported chains. We handle the routing, swaps, and bridging.",
    icon: <WalletIcon />,
  },
  {
    number: "03",
    title: "Pay. They receive USDC.",
    body: "Your payment is routed to the merchant's linked Monad wallet. They receive USDC on Monad.",
    icon: <SettleIcon />,
  },
]

const assets: Array<{
  token: TokenSymbol
  chain: ChainId
  name: string
  network: string
  color: string
}> = [
  { token: "MON", chain: "monad", name: "MON", network: "Monad", color: "#836ef9" },
  { token: "USDC", chain: "base", name: "USDC", network: "Base", color: "#2775ca" },
  { token: "ETH", chain: "arbitrum", name: "ETH", network: "Arbitrum", color: "#627eea" },
]

export default function HomePage() {
  return (
    <div className="site-shell">
      <header className="navbar">
        <div className="nav-inner">
          <Logo />
          <nav aria-label="Main navigation">
            <a href="#how">How it Works</a>
            <a href="#assets">Supported Assets</a>
            <a href="#merchants">For Merchants</a>
          </nav>
          <div className="nav-actions">
            <Link className="wallet-button" href="/app">
              <span className="wallet-dot" />
              Launch App
            </Link>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-content">
              <h1 className="fade-up">
                Pay with Crypto.
                <br />
                <span>Scan any merchant QR.</span>
              </h1>
              <p className="hero-sub fade-up delay-two">
                Scan a merchant QR. Pay with crypto from multiple chains.
                Merchants receive USDC on Monad.
              </p>
              <div className="hero-actions fade-up delay-three">
                <Button href="/app">Start Paying</Button>
                <Button href="#merchants" secondary>
                  For Merchants
                </Button>
              </div>
              <div className="trust fade-up delay-three">
                <ChainIcon chain="monad" size={21} />
                <span>
                  Powered by <strong>Monad</strong>
                </span>
              </div>
            </div>
            <PhoneMockup />
          </div>
        </section>

        <section className="section how-section" id="how">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-kicker">Simple by design</span>
              <h2>
                Crypto payments,
                <br />
                without the complexity.
              </h2>
              <p>
                From scan to settlement in seconds. No new hardware, no new
                habits.
              </p>
            </div>
            <ScrollReveal className="steps">
              <div className="step-line" aria-hidden="true" />
              {steps.map((step) => (
                <article className="step-card" key={step.number}>
                  <span className="step-number">{step.number}</span>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </ScrollReveal>
          </div>
        </section>

        <section className="section assets-section" id="assets">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <span className="section-kicker">Pay your way</span>
                <h2>
                  One checkout.
                  <br />
                  Multiple chains.
                </h2>
              </div>
              <p>
                Use the assets you already own. MonadPay finds the fastest, most
                efficient route to settle every transaction.
              </p>
            </div>
            <div className="asset-grid">
              {assets.map((asset) => (
                <article className="asset-card" key={asset.name}>
                  <div className="asset-top">
                    <TokenChainIcon
                      symbol={asset.token}
                      chain={asset.chain}
                      size={48}
                    />
                    <span className="live-badge">
                      <i style={{ background: asset.color }} />
                      Supported
                    </span>
                  </div>
                  <div className="asset-info">
                    <h3>{asset.name}</h3>
                    <span>on {asset.network}</span>
                  </div>
                </article>
              ))}
            </div>
            <p className="more-assets">
              <span>+</span> More assets and networks coming soon
            </p>
          </div>
        </section>

        <section className="section merchant-section" id="merchants">
          <ScrollReveal className="container merchant-panel">
            <div className="merchant-visual" aria-hidden="true">
              <div className="settlement-card settlement-main">
                <div className="settlement-head">
                  <span>Payment received</span>
                  <span className="success-check">
                    <Check />
                  </span>
                </div>
                <strong>
                  42.00 <small>USDC</small>
                </strong>
                <div className="settlement-detail">
                  <span>Settled on Monad</span>
                  <span>Just now</span>
                </div>
              </div>
            </div>
            <div className="merchant-copy">
              <span className="section-kicker light">Built for business</span>
              <h2>
                Accept payments.
                <br />
                Receive USDC.
              </h2>
              <p>
                Link your merchant QR to a Monad wallet. When a customer pays
                with crypto, MonadPay routes the payment and settles USDC
                directly to your wallet.
              </p>
              <ul>
                <li>
                  <Check small />
                  Link your merchant QR once
                </li>
                <li>
                  <Check small />
                  Receive USDC on Monad
                </li>
              </ul>
              <Button href="/merchant" dark>
                Join as a Merchant
              </Button>
            </div>
          </ScrollReveal>
        </section>

        <section className="section final-cta" id="start">
          <div className="cta-orb" />
          <div className="container cta-content">
            <h2>
              Your crypto.
              <br />
              <span>Their payment.</span>
            </h2>
            <p>
              Spend across chains. Settle on Monad. Pay wherever merchant QR
              payments are accepted.
            </p>
            <Button href="/app" dark>
              Get Started
            </Button>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-inner">
          <div>
            <Logo />
            <p>Making crypto useful, one payment at a time.</p>
          </div>
          <div className="footer-links">
            <a href="#">
              Documentation <ArrowUpRight />
            </a>
            <a href="#">
              GitHub <ArrowUpRight />
            </a>
            <a href="#">
              Twitter / X <ArrowUpRight />
            </a>
            <a href="#">Disclaimer</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} MonadPay. All rights reserved.</span>
          <span>Built for the Monad ecosystem.</span>
        </div>
      </footer>
    </div>
  )
}
