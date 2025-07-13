import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../../../utils/responseHelper";
import { ErrorMessages } from "@/utils/errorMessages";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword, confirmPassword } = await req.json();

    // Validate input fields
    if (!email) return errorResponse(ErrorMessages.emailRequired, 400);
    if (!newPassword)
      return errorResponse(ErrorMessages.newPasswordRequired, 400);
    if (!confirmPassword)
      return errorResponse(ErrorMessages.confirmPasswordRequired, 400);
    if (newPassword !== confirmPassword)
      return errorResponse(ErrorMessages.passwordMismatch, 400);

    const normalizedEmail = email.trim().toLowerCase();

    // Find user with verified status
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail, verified: true },
    });

    if (!user) return errorResponse(ErrorMessages.userNotFound, 404);

    // Prevent user from reusing the same password
    if (user.password) {
      const passwordMatch = await bcrypt.compare(newPassword, user.password);
      if (passwordMatch) {
        return errorResponse("Same Password not allowed", 400);
      }
    }

    // Hash and update the password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedNewPassword,
        isPasswordSet: true,
        role: "CUSTOMER",
      },
    });

    // Generate JWT token
    // const token = jwt.sign(
    //   { email: user.email, id: user.id },
    //   process.env.JWT_SECRET || "N4wL1NMnook2oQA47D6t3m3gw4bnlepd",
    //   { expiresIn: "1h" }
    // );
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET || "N4wL1NMnook2oQA47D6t3m3gw4bnlepd"
    );

    // Exclude password from response
    const { password, ...currUser } = user;

    return successResponse({ ...currUser, token }, "Password set successfully");
  } catch (error) {
    console.error("Password Reset Error:", error);
    return errorResponse(ErrorMessages.internalServerError, 500);
  }
}
