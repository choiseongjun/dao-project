const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const VAToken = await hre.ethers.getContractFactory("VAToken");
  const token = await VAToken.deploy({
    gasPrice: hre.ethers.utils.parseUnits("1", "gwei"),
    gasLimit: 2000000,
  });
  await token.waitForDeployment();

  console.log("VA Token deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
