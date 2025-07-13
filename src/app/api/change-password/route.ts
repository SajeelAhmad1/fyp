import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";
import { successResponse, errorResponse } from "../../../utils/responseHelper";
import { ErrorMessages } from "@/utils/errorMessages";

export async function POST(req: NextRequest) {
  try {
    const { email, currentPassword, newPassword, confirmPassword } =
      await req.json();

    // Input validations
    if (!email) return errorResponse(ErrorMessages.emailRequired, 400);
    if (!currentPassword)
      return errorResponse("Current password is required", 400);
    if (!newPassword)
      return errorResponse(ErrorMessages.newPasswordRequired, 400);
    if (!confirmPassword)
      return errorResponse(ErrorMessages.confirmPasswordRequired, 400);

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return errorResponse(ErrorMessages.passwordMismatch, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user with verified status
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail, verified: true },
    });

    if (!user) return errorResponse(ErrorMessages.userNotFound, 404);

    // Verify current password
    let isCurrentPasswordValid;
    if (user.password) {
      isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
    }
    if (!isCurrentPasswordValid) {
      return errorResponse("Current password is incorrect", 400);
    }

    // Additional password strength checks (optional but recommended)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return errorResponse(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
        400
      );
    }

    // Hash and update the password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedNewPassword,
        isPasswordSet: true,
      },
    });

    return successResponse(null, "Password changed successfully");
  } catch (error) {
    console.error("Password Change Error:", error);
    return errorResponse(ErrorMessages.internalServerError, 500);
  }
}
