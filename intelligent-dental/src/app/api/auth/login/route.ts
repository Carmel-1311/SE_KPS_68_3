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
    let firstName = ""
    let lastName = ""
    let displayName = ""
    let patientId: number | null = null

    if (account.account_role === "patient") {
      const patient = await prisma.patient.findFirst({
        where: { account_id: account.account_id },
        select: { patient_id: true, first_name: true, last_name: true }
      })
      firstName = patient?.first_name ?? ""
      lastName = patient?.last_name ?? ""
      patientId = patient?.patient_id ?? null
    } else if (account.account_role === "staff" || account.account_role === "doctor") {
      const staff = await prisma.staff.findFirst({
        where: { account_id: account.account_id },
        select: { first_name: true, last_name: true }
      })
      firstName = staff?.first_name ?? ""
      lastName = staff?.last_name ?? ""
    } else if (account.account_role === "company") {
      const company = await prisma.company.findFirst({
        where: { account_id: account.account_id },
        select: { contect_name: true, office_name: true }
      })
      firstName = company?.contect_name ?? ""
      lastName = ""
      displayName = company?.office_name ?? ""
    }

    if (!displayName) {
      displayName = `${firstName} ${lastName}`.trim()
    }

    return NextResponse.json(
      {
        data: {
          account_id: account.account_id,
          patient_id: patientId,
          username: account.username ?? account.email ?? "",
          role,
          token: randomUUID(),
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
