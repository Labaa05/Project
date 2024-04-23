import express from "express";
import { router } from "./routes/router.js";
import path from "path";

const PORT = 3000;
const app = express();

app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
