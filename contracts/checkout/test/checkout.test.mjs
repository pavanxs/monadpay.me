import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserProvider, ContractFactory, id, ZeroHash } from "ethers";
import ganache from "ganache";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readArtifact = name => JSON.parse(fs.readFileSync(path.join(root, "artifacts", name + ".json"), "utf8"));
const mockArtifact = readArtifact("MockUSDC");
const checkoutArtifact = readArtifact("MonadPayCheckout");
const AMOUNT = 1_500_000n; // 1.50 mock USDC (6 decimals)
const INVOICE_ID = id("store-1:invoice-1");

async function setup() {
  const chain = ganache.provider({ logging: { quiet: true }, chain: { chainId: 143 }, wallet: { totalAccounts: 3 } });
  const provider = new BrowserProvider(chain);
  const merchant = await provider.getSigner(0);
  const customer = await provider.getSigner(1);
  const other = await provider.getSigner(2);

  const mock = await new ContractFactory(mockArtifact.abi, mockArtifact.bytecode, merchant).deploy();
  await mock.waitForDeployment();

  const checkout = await new ContractFactory(checkoutArtifact.abi, checkoutArtifact.bytecode, merchant).deploy(await mock.getAddress());
  await checkout.waitForDeployment();

  await (await mock.mint(await customer.getAddress(), 10_000_000n)).wait();
  const block = await provider.getBlock("latest");
  const expiry = Number(block.timestamp) + 3600;
  return { provider, merchant, customer, other, mock, checkout, expiry };
}

async function create(f, invoiceId = INVOICE_ID, amount = AMOUNT, expiry = f.expiry) {
  return (await f.checkout.connect(f.merchant).createInvoice(invoiceId, amount, expiry)).wait();
}

test("merchant can create an invoice bound to their address and amount", async () => {
  const f = await setup();
  const receipt = await create(f);
  const info = await f.checkout.invoices(INVOICE_ID);

  assert.equal(info.merchant.toLowerCase(), (await f.merchant.getAddress()).toLowerCase());
  assert.equal(info.amount, AMOUNT);
  assert.equal(info.expiresAt, BigInt(f.expiry));
  assert.equal(info.payer, "0x0000000000000000000000000000000000000000");
  assert.ok(receipt.logs.some(log => log.topics[0] === f.checkout.interface.getEvent("InvoiceCreated").topicHash));
});

test("a successful checkout transfers tokens to the merchant, emits receipt and stores payer", async () => {
  const f = await setup();
  await create(f);
  const merchantBefore = await f.mock.balanceOf(await f.merchant.getAddress());
  const customerBefore = await f.mock.balanceOf(await f.customer.getAddress());

  await (await f.mock.connect(f.customer).approve(await f.checkout.getAddress(), AMOUNT)).wait();
  const receipt = await (await f.checkout.connect(f.customer).payInvoice(INVOICE_ID)).wait();

  assert.equal(await f.mock.balanceOf(await f.merchant.getAddress()), merchantBefore + AMOUNT);
  assert.equal(await f.mock.balanceOf(await f.customer.getAddress()), customerBefore - AMOUNT);
  assert.equal(await f.mock.balanceOf(await f.checkout.getAddress()), 0n);
  assert.equal((await f.checkout.invoices(INVOICE_ID)).payer.toLowerCase(), (await f.customer.getAddress()).toLowerCase());

  const eventLog = receipt.logs.find(log => log.topics[0] === f.checkout.interface.getEvent("InvoicePaid").topicHash);
  assert.ok(eventLog, "Missing verifiable InvoicePaid log");
  const parsed = f.checkout.interface.parseLog(eventLog);
  assert.equal(parsed.args.invoiceId, INVOICE_ID);
  assert.equal(parsed.args.amount, AMOUNT);
  assert.equal(parsed.args.merchant.toLowerCase(), (await f.merchant.getAddress()).toLowerCase());
});

test("the same invoice ID cannot be created twice", async () => {
  const f = await setup();
  await create(f);
  await assert.rejects(f.checkout.connect(f.merchant).createInvoice(INVOICE_ID, AMOUNT, f.expiry));
  await assert.rejects(f.checkout.connect(f.other).createInvoice(INVOICE_ID, AMOUNT, f.expiry));
});

test("an invoice cannot be paid twice", async () => {
  const f = await setup();
  await create(f);
  await (await f.mock.connect(f.customer).approve(await f.checkout.getAddress(), AMOUNT * 2n)).wait();
  await (await f.checkout.connect(f.customer).payInvoice(INVOICE_ID)).wait();
  await assert.rejects(f.checkout.connect(f.customer).payInvoice(INVOICE_ID));
  assert.equal(await f.mock.balanceOf(await f.merchant.getAddress()), AMOUNT);
});

test("a non-existent invoice is rejected", async () => {
  const f = await setup();
  await assert.rejects(f.checkout.connect(f.customer).payInvoice(INVOICE_ID));
});

test("expired invoices are rejected", async () => {
  const f = await setup();
  await create(f);
  await (await f.mock.connect(f.customer).approve(await f.checkout.getAddress(), AMOUNT)).wait();
  await f.provider.send("evm_increaseTime", [3601]);
  await f.provider.send("evm_mine", []);
  await assert.rejects(f.checkout.connect(f.customer).payInvoice(INVOICE_ID));
});

test("zero invoice ID and zero amount are rejected", async () => {
  const f = await setup();
  await assert.rejects(f.checkout.connect(f.merchant).createInvoice(ZeroHash, AMOUNT, f.expiry));
  await assert.rejects(f.checkout.connect(f.merchant).createInvoice(INVOICE_ID, 0n, f.expiry));
});

test("the expiry must be in the future", async () => {
  const f = await setup();
  await assert.rejects(f.checkout.connect(f.merchant).createInvoice(INVOICE_ID, AMOUNT, f.expiry - 3600));
});

test("missing approval reverts without falsely recording a completed invoice", async () => {
  const f = await setup();
  await create(f);
  await assert.rejects(f.checkout.connect(f.customer).payInvoice(INVOICE_ID));
  assert.equal((await f.checkout.invoices(INVOICE_ID)).payer, "0x0000000000000000000000000000000000000000");
  assert.equal(await f.mock.balanceOf(await f.merchant.getAddress()), 0n);
});

test("insufficient balance reverts without marking an invoice paid", async () => {
  const f = await setup();
  const tooMuch = 20_000_000n;
  await create(f, INVOICE_ID, tooMuch);
  await (await f.mock.connect(f.customer).approve(await f.checkout.getAddress(), tooMuch)).wait();
  await assert.rejects(f.checkout.connect(f.customer).payInvoice(INVOICE_ID));
  assert.equal((await f.checkout.invoices(INVOICE_ID)).payer, "0x0000000000000000000000000000000000000000");
});

test("different invoice IDs can be paid independently", async () => {
  const f = await setup();
  const secondId = id("store-1:invoice-2");
  await create(f);
  await create(f, secondId);
  await (await f.mock.connect(f.customer).approve(await f.checkout.getAddress(), AMOUNT * 2n)).wait();
  await (await f.checkout.connect(f.customer).payInvoice(INVOICE_ID)).wait();
  await (await f.checkout.connect(f.customer).payInvoice(secondId)).wait();
  assert.equal(await f.mock.balanceOf(await f.merchant.getAddress()), AMOUNT * 2n);
});
