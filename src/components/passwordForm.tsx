"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader } from "./shared/loader";

function ClientPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const searchParams: any = useSearchParams();
  const email = searchParams.get("email") || "";

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must include at least one uppercase letter")
      .matches(/[a-z]/, "Password must include at least one lowercase letter")
      .matches(/\d/, "Password must include at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must include at least one special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords do not match")
      .required("Confirm Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,

    onSubmit: async (values) => {
      setLoading(true);
      try {
        setLoading(true);
        const result = await signIn("credentials", {
          redirect: true,
          email: email.toString(),
          password: values.password,
          isSettingPassword: "true",
          callbackUrl: `/profile?email=${encodeURIComponent(
            email.toString()
          )}`,
        });
        if (result?.ok) {
          toast.success("🎉 Password set successfully!");
          setLoading(false);
          router.push(
            `/profile?email=${encodeURIComponent(email.toString())}`
          );
        }
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        toast.error(error?.message || "🚨Oops... Something went wrong!", {
          description: error?.response.data.message || error.message,
        });
      }
    },
  });

  return (
    <form
      className="w-full max-w-[410px] flex flex-col items-center space-y-4 "
      onSubmit={formik.handleSubmit}
    >
      <div className="relative w-full">
        <div className="flex lg:flex-row">
          <label
            htmlFor="password"
            className="text-black font-semibold mx-1 mb-1"
          >
            Password
          </label>
          <p className="text-red-500">*</p>
        </div>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full border p-2 py-4 px-6 rounded-[6.56px] text-sm focus:border-blue-500  focus:outline-none ${
              formik.touched.password && formik.errors.password
                ? "border-red-500"
                : "border-blue-500"
            }`}
          />
          <div
            className="absolute right-3 top-6 transform -translate-y-1/2 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOffIcon className="h-6 w-6 text-gray-400" />
            ) : (
              <EyeIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 mt-2">{formik.errors.password}</p>
          )}
        </div>
      </div>
      <div className="relative w-full">
        <div className="flex lg:flex-row">
          <label
            htmlFor="confirmPassword"
            className="text-black font-semibold mx-1 mb-1"
          >
            Confirm Password
          </label>
          <p className="text-red-500">*</p>
        </div>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-2 border px-6 py-4 rounded-[6.56px] text-sm  focus:border-blue-500 focus:outline-none ${
              formik.touched.confirmPassword && formik.errors.confirmPassword
                ? "border-red-500"
                : "border-blue-500"
            }`}
          />
          <div
            className="absolute right-3 top-6 transform -translate-y-1/2 cursor-pointer"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? (
              <EyeOffIcon className="h-6 w-6 text-gray-400" />
            ) : (
              <EyeIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 mt-2">{formik.errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {loading ? (
        <button
          className="w-full rounded-[6.56px] py-3 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-[#FFFFFF]"
          type="button"
          disabled
        >
          Submitting...
        </button>
      ) : (
        <button
          className="w-full rounded-[6.56px] py-3 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-300 text-[#FFFFFF]"
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid || loading}
        >
          Continue
        </button>
      )}
    </form>
  );
}

export default function WrappedClientPasswordForm() {
  return <ClientPasswordForm />;
}
 