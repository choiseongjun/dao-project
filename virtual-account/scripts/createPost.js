const hre = require("hardhat");

async function main() {
  // Board 컨트랙트 주소
  const boardAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

  // Board 컨트랙트 인스턴스 가져오기
  const board = await hre.ethers.getContractAt("Board", boardAddress);

  // 여러 게시글 작성
  const posts = [
    "안녕하세요! 첫 번째 게시글입니다.",
    "두 번째 게시글을 작성합니다.",
    "세 번째 게시글입니다.",
    "네 번째 게시글을 작성합니다.",
    "다섯 번째 게시글입니다.",
  ];

  for (let i = 0; i < posts.length; i++) {
    console.log(`Creating post ${i + 1}...`);
    const tx = await board.createPost(posts[i]);
    await tx.wait();
    console.log(`Post ${i + 1} created successfully!`);
  }

  // 사용자의 게시글 수 확인
  const [signer] = await hre.ethers.getSigners();
  const postCount = await board.getUserPostCount(signer.address);
  console.log(`Your total posts: ${postCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
