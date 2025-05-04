import { ethers } from "hardhat";

async function main() {
  // 새로운 배포된 컨트랙트 주소로 업데이트
  const DAO_ADDRESS = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690"; // DAOVoting 컨트랙트 주소
  const VOTING_TOKEN_ADDRESS = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E"; // VotingToken 컨트랙트 주소

  // 컨트랙트 가져오기
  const DAOVoting = await ethers.getContractFactory("DAOVoting");
  const daoVoting = DAOVoting.attach(DAO_ADDRESS);

  const VotingToken = await ethers.getContractFactory("VotingToken");
  const votingToken = VotingToken.attach(VOTING_TOKEN_ADDRESS);

  // 현재 연결된 계정 가져오기
  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();

  console.log("\nGas Analysis Report");
  console.log("==================");

  // 현재 제안 수 확인
  const currentProposalCount = await daoVoting.proposalCount();
  console.log(`Current proposal count: ${currentProposalCount}`);

  // 1. 제안 생성 가스 측정
  console.log("\n1. Creating a proposal...");
  const createProposalTx = await daoVoting.createProposal("Gas Test Proposal");
  const createProposalReceipt = await createProposalTx.wait();
  console.log(
    `Gas used for creating proposal: ${createProposalReceipt.gasUsed.toString()}`
  );

  // 새로 생성된 제안 ID 가져오기
  const newProposalId = (await daoVoting.proposalCount()) - 1;
  console.log(`New proposal ID: ${newProposalId}`);

  // 2. 투표 가스 측정
  console.log("\n2. Voting on proposal...");
  const voteTx = await daoVoting.vote(newProposalId, true);
  const voteReceipt = await voteTx.wait();
  console.log(`Gas used for voting: ${voteReceipt.gasUsed.toString()}`);

  // 3. 보상 청구 가스 측정
  console.log("\n3. Claiming rewards...");
  const claimRewardsTx = await daoVoting.claimRewards();
  const claimRewardsReceipt = await claimRewardsTx.wait();
  console.log(
    `Gas used for claiming rewards: ${claimRewardsReceipt.gasUsed.toString()}`
  );

  // 4. 읽기 작업 가스 측정
  console.log("\n4. Reading operations...");
  const finalProposalCount = await daoVoting.proposalCount();
  console.log(`Final proposal count: ${finalProposalCount}`);

  const userRewards = await daoVoting.rewards(userAddress);
  console.log(
    `Current user rewards: ${ethers.utils.formatEther(userRewards)} tokens`
  );

  // 가스 최적화 제안
  console.log("\nGas Optimization Suggestions:");
  console.log("1. 제안 생성 시 문자열 길이 최적화");
  console.log("2. 투표 시 불필요한 상태 변경 최소화");
  console.log("3. 이벤트 발생 최적화");
  console.log("4. 스토리지 변수 사용 최적화");
  console.log("\nGas Usage Summary:");
  console.log(
    `- Proposal Creation: ${createProposalReceipt.gasUsed.toString()} gas`
  );
  console.log(`- Voting: ${voteReceipt.gasUsed.toString()} gas`);
  console.log(
    `- Claiming Rewards: ${claimRewardsReceipt.gasUsed.toString()} gas`
  );
  console.log(
    `- Total Gas Used: ${createProposalReceipt.gasUsed
      .add(voteReceipt.gasUsed)
      .add(claimRewardsReceipt.gasUsed)
      .toString()} gas`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
