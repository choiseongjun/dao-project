import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { daoRoutes } from "./routes/dao";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// DAO 라우트 설정
app.use("/api/dao", daoRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
