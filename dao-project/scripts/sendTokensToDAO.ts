import { ethers } from "hardhat";

async function main() {
  const DAO_ADDRESS = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
  const VOTING_TOKEN_ADDRESS = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E";

  // 컨트랙트 가져오기
  const VotingToken = await ethers.getContractFactory("VotingToken");
  const votingToken = VotingToken.attach(VOTING_TOKEN_ADDRESS);

  // 현재 연결된 계정 가져오기
  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();

  // DAO 컨트랙트로 토큰 전송 (1000 토큰)
  const amount = ethers.utils.parseEther("1000");
  console.log(
    `Sending ${ethers.utils.formatEther(amount)} tokens to DAO contract...`
  );

  const tx = await votingToken.transfer(DAO_ADDRESS, amount);
  await tx.wait();

  // 잔액 확인
  const daoBalance = await votingToken.balanceOf(DAO_ADDRESS);
  console.log(
    `DAO contract balance: ${ethers.utils.formatEther(daoBalance)} tokens`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
