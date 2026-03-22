import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { verifyPassword } from "@/utils/password"
import jwt from "jsonwebtoken"

type UserRole = "dentist" | "patient" | "staff" | "company"

type LoginBody = {
  username?: string
  password?: string
}

export async function POST(request: Request) {
  try {
    const secret = process.env.JWT_SECRET?.trim()
    if (!secret) {
      return NextResponse.json({ message: "JWT_SECRET is not configured" }, { status: 500 })
    }

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
        account_role: true,
        patient: {
          select: { patient_id: true, first_name: true, last_name: true }
        },
        staff: {
          select: { staff_id: true, first_name: true, last_name: true, role: true }
        },
        company: {
          select: { company_id: true, contect_name: true, office_name: true }
        }
      }
    })

    if (!account || !account.password_hash) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    const ok = verifyPassword(password, account.password_hash)
    if (!ok) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    const role: UserRole =
      account.account_role === "company"
        ? "company"
        : account.account_role === "doctor" || account.staff?.role === "dentist"
          ? "dentist"
          : account.account_role === "staff"
            ? "staff"
            : "patient"

    const userId =
      role === "patient"
        ? account.patient?.patient_id
        : role === "company"
          ? account.company?.company_id
          : account.staff?.staff_id

    if (!userId) {
      return NextResponse.json({ message: "Account profile is incomplete" }, { status: 500 })
    }

    let firstName = ""
    let lastName = ""
    let displayName = ""
    let patientId: number | null = null

    if (role === "patient") {
      firstName = account.patient?.first_name ?? ""
      lastName = account.patient?.last_name ?? ""
      patientId = account.patient?.patient_id ?? null
    } else if (role === "staff" || role === "dentist") {
      firstName = account.staff?.first_name ?? ""
      lastName = account.staff?.last_name ?? ""
    } else if (role === "company") {
      firstName = account.company?.contect_name ?? ""
      lastName = ""
      displayName = account.company?.office_name ?? ""
    }

    if (!displayName) {
      displayName = `${firstName} ${lastName}`.trim()
    }

    return NextResponse.json(
      {
        data: {
          account_id: account.account_id,
          user_id: userId,
          patient_id: patientId,
          username: account.username ?? account.email ?? "",
          role,
          token: jwt.sign({ id: userId, role }, secret, { expiresIn: "7d" }),
          first_name: firstName,
          last_name: lastName,
          display_name: displayName
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("POST /api/auth/login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
