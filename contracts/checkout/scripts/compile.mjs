import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = {
  "src/MonadPayCheckout.sol": { content: fs.readFileSync(path.join(root, "src", "MonadPayCheckout.sol"), "utf8") },
  "test/MockUSDC.sol": { content: fs.readFileSync(path.join(root, "test", "MockUSDC.sol"), "utf8") }
};
const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), {
  import: (importPath) => {
    const dependencyPath = path.resolve(root, "node_modules", importPath);
    if (!dependencyPath.startsWith(path.resolve(root, "node_modules") + path.sep)) {
      return { error: `Invalid import: ${importPath}` };
    }
    try {
      return { contents: fs.readFileSync(dependencyPath, "utf8") };
    } catch (error) {
      return { error: `Could not load ${importPath}: ${error.message}` };
    }
  }
}));

for (const issue of output.errors ?? []) {
  if (issue.severity === "error") console.error(issue.formattedMessage);
  else console.warn(issue.formattedMessage);
}
if ((output.errors ?? []).some(issue => issue.severity === "error")) {
  process.exit(1);
}

const outDir = path.join(root, "artifacts");
fs.mkdirSync(outDir, { recursive: true });
for (const [source, contractName] of [
  ["src/MonadPayCheckout.sol", "MonadPayCheckout"],
  ["test/MockUSDC.sol", "MockUSDC"]
]) {
  const contract = output.contracts[source][contractName];
  const artifact = { contractName, abi: contract.abi, bytecode: "0x" + contract.evm.bytecode.object };
  fs.writeFileSync(path.join(outDir, contractName + ".json"), JSON.stringify(artifact, null, 2) + "\n");
  console.log(`Compiled ${contractName}`);
}
