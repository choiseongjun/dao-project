const hre = require("hardhat");

async function main() {
  // VA 토큰 컨트랙트 주소
  const vaTokenAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  // VA 토큰 컨트랙트 인스턴스 가져오기
  const vaToken = await hre.ethers.getContractAt("VAToken", vaTokenAddress);

  // 현재 계정 주소
  const [signer] = await hre.ethers.getSigners();

  // 잔액 확인
  const balance = await vaToken.balanceOf(signer.address);
  console.log(
    `Your VA token balance: ${hre.ethers.utils.formatUnits(balance, 18)} VA`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
