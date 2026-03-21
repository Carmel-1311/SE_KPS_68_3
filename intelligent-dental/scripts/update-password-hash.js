const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("crypto");

const prisma = new PrismaClient();
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function hashPassword(plain) {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = scryptSync(plain, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const accounts = await prisma.account.findMany({
    select: { account_id: true, password_hash: true, username: true, email: true }
  });

  const toUpdate = accounts.filter(
    (a) => a.password_hash && !a.password_hash.startsWith("scrypt$")
  );

  for (const a of toUpdate) {
    const plain = a.password_hash;
    const hashed = hashPassword(plain);
    await prisma.account.update({
      where: { account_id: a.account_id },
      data: { password_hash: hashed }
    });
  }

  console.log(`updated ${toUpdate.length} accounts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
