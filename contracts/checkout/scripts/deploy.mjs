import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ContractFactory, JsonRpcProvider, Wallet, getAddress } from "ethers";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rpcUrl = process.env.MONAD_RPC_URL;
const signerKey = process.env.MONAD_DEPLOYER_KEY;
const tokenAddress = process.env.MONAD_USDC_ADDRESS;

if (!rpcUrl || !signerKey || !tokenAddress) {
  throw new Error("Set MONAD_RPC_URL, MONAD_DEPLOYER_KEY and MONAD_USDC_ADDRESS locally. Do not share signing credentials.");
}
const provider = new JsonRpcProvider(rpcUrl);
const network = await provider.getNetwork();
if (![143n, 10143n].includes(network.chainId)) {
  throw new Error(`Refusing to deploy on unsupported chain ${network.chainId}`);
}
const settlement = getAddress(tokenAddress);
if (await provider.getCode(settlement) === "0x") {
  throw new Error("Settlement token address has no deployed contract code.");
}

const artifact = JSON.parse(fs.readFileSync(path.join(root, "artifacts", "MonadPayCheckout.json"), "utf8"));
const signer = new Wallet(signerKey, provider);
console.log("Chain ID:", network.chainId.toString());
console.log("Deploying from:", signer.address);
console.log("Configured settlement token:", settlement);

const checkout = await new ContractFactory(artifact.abi, artifact.bytecode, signer).deploy(settlement);
const tx = checkout.deploymentTransaction();
console.log("Deployment transaction:", tx.hash);
await checkout.waitForDeployment();
console.log("Checkout contract:", await checkout.getAddress());
console.log("Verified settlement token configuration:", await checkout.settlementToken());
