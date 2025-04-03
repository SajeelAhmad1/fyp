// File: app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { successResponse, errorResponse } from "../../../utils/responseHelper";
import { ErrorMessages } from "@/utils/errorMessages";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

export async function POST(req: NextRequest) {
    let { email } = await req.json();
  
    if (!email) {
      return errorResponse(ErrorMessages.emailRequired, 400);
    }
  
    // Check if user exists and is verified
    const user = await prisma.user.findUnique({
      where: { email, verified: true },
    });
  
    if (!user) {
      // Don't reveal if user doesn't exist for security
      return successResponse(null, "If this email exists, a reset OTP has been sent.");
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // Delete any existing OTPs for this email first
      await prisma.otp.deleteMany({
        where: { email }
      });

      // Create new OTP with purpose
      await prisma.otp.create({
        data: {
          email,
          otp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
        },
      });

      // Send email with OTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_APP_PASSWORD
        }
      });
        
      await transporter.sendMail({
        from: '"Lyalla and Lora" <sajeelashiq1@gmail.com>',
        to: email,
        subject: "Password Reset OTP - Lyalla and Lora",
        html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; padding: 20px; text-align: center; border-radius: 10px;">
            <div style="background: #F19B12; padding: 15px; border-radius: 10px;">
              <h1 style="margin: 0; font-size: 28px; color: #ffffff;">Password Reset</h1>
            </div>
            <div style="margin-top: 20px; padding: 20px; background-color: #ffffff; border-radius: 10px; border: 2px solid #F19B12;">
              <p style="font-size: 20px; color: #F19B12; margin: 0;">Your Password Reset OTP</p>
              <div style="margin: 10px 0; padding: 10px; border-radius: 5px; background-color: #f0f4f8; display: inline-block;">
                <p style="font-size: 32px; font-weight: bold; color: #F19B12; letter-spacing: 5px;">${otp}</p>
              </div>
              <p style="font-size: 16px; color: #555555; margin-top: 20px;">Enter this code to reset your password.</p>
              <p style="font-size: 14px; color: #777777; margin-top: 10px;">This OTP will expire in 5 minutes.</p>
            </div>
            <div style="margin-top: 30px; padding: 10px; border-top: 1px solid #F19B12;">
              <p style="font-size: 12px; color: #777777;">© 2025 Lyalla and Lora. All rights reserved.</p>
            </div>
          </div>
        `,
      });
  
      return successResponse(null, "If this email exists, a reset OTP has been sent.");
    } catch (error: any) {
      return errorResponse(error, 500);
    }
}