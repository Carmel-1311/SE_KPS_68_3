import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { verifyPassword } from "@/utils/password"
import { randomUUID } from "crypto"

type LoginBody = {
  username?: string
  password?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody
    const username = body.username?.trim()
    const password = body.password?.trim()

    if (!username || !password) {
      return NextResponse.json({ message: "Missing username or password" }, { status: 400 })
    }

    const account = await prisma.account.findFirst({
      where: { OR: [{ username }, { email: username }] },
      select: {
        account_id: true,
        username: true,
        email: true,
        password_hash: true,
        account_role: true
      }
    })

    if (!account || !account.password_hash) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    const ok = verifyPassword(password, account.password_hash)
    if (!ok) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    const role = account.account_role === "doctor" ? "dentist" : account.account_role ?? "patient"

    return NextResponse.json(
      {
        data: {
          account_id: account.account_id,
          username: account.username ?? account.email ?? "",
          role,
          token: randomUUID()
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("POST /api/auth/login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
