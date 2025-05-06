const hre = require("hardhat");

async function main() {
  const tokenAddress = "YOUR_TOKEN_ADDRESS"; // 배포 후 받은 토큰 주소로 교체해주세요
  const amount = hre.ethers.parseEther("1000"); // 1000 VA 토큰 발행

  const token = await hre.ethers.getContractAt("VAToken", tokenAddress);
  const [signer] = await hre.ethers.getSigners();

  console.log("Minting tokens...");
  const tx = await token.mint(signer.address, amount);
  await tx.wait();

  console.log(
    "Minted",
    hre.ethers.formatEther(amount),
    "VA tokens to",
    signer.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
