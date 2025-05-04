import { Router } from "express";
import { ethers } from "ethers";
import DAOVotingABI from "../../../frontend/src/contracts/DAOVoting.json";

const router = Router();

// 컨트랙트 설정
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || "http://localhost:8545"
);
const privateKey =
  process.env.PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new ethers.Wallet(privateKey, provider);

const daoContract = new ethers.Contract(
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  DAOVotingABI.abi,
  wallet
);

// 제안 생성
router.post("/proposals", async (req, res) => {
  try {
    const { title } = req.body;

    // 제목이 비어있는지만 확인
    if (!title) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    try {
      // 가스 가격 확인
      const gasPrice = await provider.getGasPrice();
      if (gasPrice.gt(ethers.utils.parseUnits("100", "gwei"))) {
        return res.status(400).json({ error: "Gas price too high" });
      }

      // 트랜잭션 전송 (string 타입으로 전달)
      const tx = await daoContract.createProposal(title);
      const receipt = await tx.wait();

      res.json({
        success: true,
        transactionHash: receipt.transactionHash,
        proposalId: receipt.events[0].args.id,
      });
    } catch (error: any) {
      console.error("Detailed error:", error);
      if (error.message.includes("Title too long")) {
        return res.status(400).json({ error: "Title is too long" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating proposal:", error);
    res.status(500).json({ error: "Failed to create proposal" });
  }
});

// 투표
router.post("/vote", async (req, res) => {
  try {
    const { proposalId, support } = req.body;

    const tx = await daoContract.vote(proposalId, support);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ error: "Failed to vote" });
  }
});

// 투표 취소
router.post("/cancel-vote", async (req, res) => {
  try {
    const { proposalId } = req.body;

    const tx = await daoContract.cancelVote(proposalId);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error("Error canceling vote:", error);
    res.status(500).json({ error: "Failed to cancel vote" });
  }
});

// 보상 청구
router.post("/claim-rewards", async (req, res) => {
  try {
    const tx = await daoContract.claimRewards();
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error("Error claiming rewards:", error);
    res.status(500).json({ error: "Failed to claim rewards" });
  }
});

// 제안 목록 조회
router.get("/proposals", async (req, res) => {
  try {
    const proposalCount = await daoContract.proposalCount();
    const proposals = [];

    for (let i = 0; i < proposalCount; i++) {
      const proposal = await daoContract.getProposal(i);
      // bytes32를 문자열로 변환
      const title = ethers.utils.parseBytes32String(proposal.title);
      proposals.push({
        id: i,
        title: title,
        startTime: proposal.startTime,
        endTime: proposal.endTime,
        yesVotes: proposal.yesVotes,
        noVotes: proposal.noVotes,
        executed: proposal.executed,
      });
    }

    res.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

export const daoRoutes = router;
