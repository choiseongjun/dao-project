import { ethers } from "hardhat";

async function main() {
  const DAO_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const VOTING_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // VotingToken 컨트랙트 가져오기
  const VotingToken = await ethers.getContractFactory("VotingToken");
  const votingToken = VotingToken.attach(VOTING_TOKEN_ADDRESS);

  // DAO 컨트랙트로 토큰 전송 (1 ether)
  const amount = ethers.utils.parseEther("1.0");
  const tx = await votingToken.transfer(DAO_ADDRESS, amount);
  await tx.wait();

  console.log(`Transferred 1.0 tokens to DAO contract at ${DAO_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
