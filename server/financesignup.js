import { db, closeConnection } from "./models/db.js";
import bcrypt from "bcrypt";

async function run() {
  const signupName = process.argv[2];
  const signupEmail = process.argv[3];
  const signupPassword = process.argv[4];

  const hashedPassword = await bcrypt.hash(signupPassword, 10);
  await db.execute(
    "INSERT INTO financelogin (signupName, signupEmail, signupPassword) VALUES (?, ?, ?)",
    [signupName, signupEmail, hashedPassword]
  );
}

run()
  .then(() => {
    console.log("success");
    closeConnection();
  })
  .catch((e) => {
    console.log("error", e);
    closeConnection(0);
  });
