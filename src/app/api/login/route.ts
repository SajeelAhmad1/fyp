import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../../lib/prisma";
import { successResponse, errorResponse } from "../../../utils/responseHelper";
import { ErrorMessages } from "../../../utils/errorMessages";

import { Prisma } from "@prisma/client";
type UserRole = "CUSTOMER" | "VENDOR";

const JWT_SECRET = process.env.JWT_SECRET || "N4wL1NMnook2oQA47D6t3m3gw4bnlepd";

const loginResponseDto = (user: any, role: UserRole) => {
  const responseData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
  };

  if (role === "CUSTOMER") {
    return {
      ...responseData,
    };
  } else if (role === "VENDOR") {
    return {
      ...responseData,
    };
  }

  return responseData;
};

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  if (!email || !password) {
    return errorResponse("Email and password are required", 400);
  }

  try {
    const userQuery: any = {
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      include: {},
    };

    if (role) {
      userQuery.where.role = role;
    }

    if (role === "CUSTOMER") {
      userQuery.include = {
        cart: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        wishlist: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        orders: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            items: true,
          },
        },
      };
    } else if (role === "VENDOR") {
      userQuery.include = {
        products: true,
      };
    }

    const user = await prisma.user.findFirst(userQuery);

    if (!user) {
      return errorResponse(ErrorMessages.invalidEmailOrPassword, 401);
    }

    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return errorResponse(ErrorMessages.invalidEmailOrPassword, 401);
      }
    }

    // const token = jwt.sign(
    //   {
    //     email: user.email,
    //     id: user.id,
    //     role: user.role,
    //     isAdmin: user.isAdmin
    //   },
    //   JWT_SECRET,
    //   { expiresIn: "1h" }
    // );
    const token = jwt.sign(
      {
        email: user.email,
        id: user.id,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET
    );

    const { password: userPass, ...currUser } = user;

    const responseData = loginResponseDto(currUser, role as UserRole);

    return successResponse({ ...responseData, token }, "Login successful");
  } catch (error: any) {
    console.error("Login error:", error);
    const errorMessage = error.message || ErrorMessages.internalServerError;

    return errorResponse(
      process.env.NODE_ENV === "development"
        ? `Error: ${errorMessage}`
        : ErrorMessages.internalServerError,
      500
    );
  }
}
