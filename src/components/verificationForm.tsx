"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpInput from "react-otp-input";
import { otpVerification, sendOtp } from "@/lib/actions/auth";
import { toast, Toaster } from "sonner";

function VerificationForm() {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const router = useRouter();
  const searchParams: any = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");

  const handleChange = async (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    setOtp(numericValue);

    if (numericValue.length === 6) {
      try {
        setIsVerifying(true);
        const result = await otpVerification({
          email: email.toString(),
          otp: numericValue,
        });
        if (result.status === 200) {
          toast.dismiss();

          toast.success(result?.data?.message);
          setIsVerifying(false);
          router.push(
            `/password?email=${encodeURIComponent(email.toString())}`
          );
          return;
        }
      } catch (err: any) {
        setIsVerifying(false);
        toast.dismiss();

        toast.error(err?.message || "🚨Oops... Something went wrong!", {
          description: err?.response.data.message || err.message,
        });
      }
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const result = await sendOtp({ email });
      if (result.status === 200) {
        toast.dismiss();

        toast.success("OTP Resent Successfully!");
      } else {
        toast.dismiss();

        toast.error("Failed to resend OTP. Try again.");
      }
    } catch (error: any) {
      toast.dismiss();

      toast.error("🚨Oops... Something went wrong!", {
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center lg:space-y-16 font-custom">
      <form className="flex flex-row space-x-2 md:space-x-4 my-6">
        <OtpInput
          value={otp}
          onChange={handleChange}
          numInputs={6}
          renderSeparator={<span style={{ width: "0.5rem" }}></span>}
          renderInput={(props) => (
            <input
              {...props}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              onFocus={(e) => {
                e.target.style.border = "2px solid #3B82F6";
                e.target.style.outline = "1px solid #E9EDEE";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid transparent";
              }}
              style={{
                fontSize: "1.5rem",
                borderRadius: "0.5rem",
                border: "2px solid #E9EDEE",
                outline: "none",
                textAlign: "center",
                padding: "1rem",
                transition: "border-color 0.2s ease",
                font: "font-custom",
              }}
              className="h-[3rem] w-[3rem] md:h-[4.5rem] md:w-[4.5rem]"
            />
          )}
          inputStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          containerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </form>
      {isVerifying && (
        <p className="text-[#000000] text-lg font-medium">Verifying OTP...</p>
      )}
      <p className="text-[#51595A] text-base font-normal text-center">
        Didn’t receive the code?{" "}
        <span
          className="text-[#000000] cursor-pointer text-base font-bold underline"
          onClick={handleResendCode}
        >
          {isResending ? "Resending..." : "Resend Code"}{" "}
        </span>
      </p>
      <Toaster position="top-right"/>
    </div>
  );
}

export default function WrappedVerificationForm() {
  return (
    <Suspense>
      <VerificationForm />
    </Suspense>
  );
}
