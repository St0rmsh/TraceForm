import { Router } from "express";
import { users, findUserById } from "../data/users.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ success: true, data: { users } });
});

router.get("/:id", (req, res) => {
  const user = findUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, data: { user } });
});

export default router;