import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5001", 10);

app.listen(PORT, () => {
  console.log(`[demo-service] Synthetic demo service running on port ${PORT}`);
});