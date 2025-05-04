// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOVoting is Ownable {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    IERC20 public votingToken;
    uint256 public minVotingPower;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // 보상 관련 변수 추가
    uint256 public constant REWARD_AMOUNT = 0.1 * 10**18; // 0.1 토큰 (18 decimals)
    mapping(address => uint256) public userRewards;

    event ProposalCreated(uint256 indexed proposalId, string title, string description);
    event Voted(uint256 indexed proposalId, address voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event RewardDistributed(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _votingToken, uint256 _minVotingPower) Ownable(msg.sender) {
        votingToken = IERC20(_votingToken);
        minVotingPower = _minVotingPower;
    }

    function createProposal(string memory _title, string memory _description) public {
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + 7 days;
        newProposal.yesVotes = 0;
        newProposal.noVotes = 0;
        newProposal.executed = false;

        emit ProposalCreated(proposalCount, _title, _description);
        proposalCount++;
    }

    function vote(uint256 _proposalId, bool _support) public {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        require(!proposals[_proposalId].executed, "Proposal already executed");
        require(!proposals[_proposalId].hasVoted[msg.sender], "Already voted");
        require(block.timestamp >= proposals[_proposalId].startTime && 
                block.timestamp <= proposals[_proposalId].endTime, 
                "Voting period is not active");
        
        // 투표자 토큰 잔액 확인
        require(votingToken.balanceOf(msg.sender) >= minVotingPower, "Insufficient voting power");

        if (_support) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }
        
        proposals[_proposalId].hasVoted[msg.sender] = true;
        
        // 투표 보상 지급
        userRewards[msg.sender] += REWARD_AMOUNT;
        
        emit Voted(_proposalId, msg.sender, _support);
        emit RewardDistributed(msg.sender, REWARD_AMOUNT);
    }

    // 보상 청구 함수 추가
    function claimRewards() public {
        uint256 reward = userRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        userRewards[msg.sender] = 0;
        require(votingToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, reward);
    }

    function executeProposal(uint256 _proposalId) public {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        require(!proposals[_proposalId].executed, "Proposal already executed");
        require(block.timestamp > proposals[_proposalId].endTime, "Voting period not ended");
        
        proposals[_proposalId].executed = true;
        emit ProposalExecuted(_proposalId);
    }

    function getProposal(uint256 _proposalId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        bool executed
    ) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.executed
        );
    }
} 