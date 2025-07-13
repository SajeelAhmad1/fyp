import { NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import { successResponse, errorResponse } from "../../../utils/responseHelper";
import { ErrorMessages } from "@/utils/errorMessages";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return errorResponse(ErrorMessages.emailOtpRequired, 400);
  }

  try {
    let responseData = null;
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email:email,
        otp:otp,
      },
    });

    const userRecord = await prisma.user.findFirst({
      where: {
        email:email,
        verified: true,
      },
    });

    if (!otpRecord) {
      return errorResponse(ErrorMessages.invalidOtp, 400);
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      return errorResponse(ErrorMessages.expiredOtp, 400);
    }

    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    if (!userRecord) {
      responseData = await prisma.user.upsert({
        where: {
          email: email,
        },
        update: {
          verified: true,
        },
        create: {
          email: email,
          verified: true,
          password: "",
          loginType: "EMAIL"
        },
      });
    } else {
      responseData = userRecord;
    }

    return successResponse(
      responseData,
      "OTP verified and user created successfully"
    );
  } catch (error) {
    const errorMessage = error || ErrorMessages.internalServerError;
    ErrorMessages;
    const responseMessage =
      process.env.NODE_ENV === "development"
        ? `Error: ${errorMessage}`
        : ErrorMessages.internalServerErrorProduction;
    return errorResponse(responseMessage, 500);
  }
}
