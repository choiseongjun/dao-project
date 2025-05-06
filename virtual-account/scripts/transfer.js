const hre = require("hardhat");

async function main() {
  // 컨트랙트 주소
  const tokenAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  // 컨트랙트 인스턴스 가져오기
  const token = await hre.ethers.getContractAt("VAToken", tokenAddress);

  // 전송할 양 (예: 100 VA 토큰)
  const amount = hre.ethers.utils.parseUnits("100", 18);

  // 받는 사람 주소 (여기에 받는 사람의 주소를 입력하세요)
  const toAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // 예시 주소

  // 토큰 전송
  const tx = await token.transfer(toAddress, amount);
  await tx.wait();

  console.log(`Transferred 100 VA tokens to ${toAddress}`);

  // 잔액 확인
  const balance = await token.balanceOf(toAddress);
  console.log(
    `New balance of recipient: ${hre.ethers.utils.formatUnits(balance, 18)} VA`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
