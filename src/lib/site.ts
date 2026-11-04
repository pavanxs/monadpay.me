export const siteConfig = {
  name: "MonadPay",
  title: "MonadPay — Pay with crypto. Scan any merchant QR.",
  description:
    "Pay at UPI merchants with crypto from multiple chains while merchants receive USDC on Monad, connecting everyday payments with digital assets.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
} as const
