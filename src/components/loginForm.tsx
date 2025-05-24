"use client";

import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { signIn, useSession } from "next-auth/react";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import googleLogo from "../assets/images/google-logo.png";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import Image from "next/image";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

function ClientLoginForm() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const emailFromParams = searchParams?.get("email") || "";
  const from = searchParams?.get("from");
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: from || "/",
      });

      if (result?.error) {
        toast.error(result.error || "Failed to sign in with Google");
      } else {
        // Wait for session to update
        await new Promise((resolve) => setTimeout(resolve, 500));
        const updatedSession = await update();

        if (updatedSession?.user) {
          redirectBasedOnRole(updatedSession.user);
        } else {
          router.push(from || "/");
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Error signing in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const redirectBasedOnRole = (user: any) => {
    if (!user) {
      router.push("/");
      return;
    }

    if (user.role === "ADMIN") {
      router.push("/admin");
    } else if (user.role === "VENDOR") {
      router.push("/vendor");
    } else if (user.role === null && user.token) {
      if (!user.isPasswordSet) {
        router.push(`/password?email=${encodeURIComponent(user.email)}`);
      } else if (!user.isProfileComplete) {
        router.push(`/doctor/profile?email=${encodeURIComponent(user.email)}`);
      } else {
        router.push("/");
      }
    } else {
      router.push(from || "/");
    }
  };

  return (
    <div className="w-full">
      <Formik
        initialValues={{
          email: emailFromParams || "",
          password: "",
        }}
        validationSchema={LoginSchema}
        validateOnChange={true}
        validateOnBlur={false}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const result = await signIn("credentials", {
              redirect: false,
              email: values.email,
              password: values.password,
              isSettingPassword: "false",
              callbackUrl: "/",
            });
            setSubmitting(false);

            if (result?.error) {
              toast.error("Error", {
                description: "Incorrect email or password",
              });
            } else {
              // Wait for session to update
              await new Promise((resolve) => setTimeout(resolve, 500));
              const updatedSession = await update();

              if (updatedSession?.user) {
                redirectBasedOnRole(updatedSession.user);
              } else {
                router.push(from || "/");
              }
            }
          } catch (err) {
            toast.error("Error", {
              description: "🚨Oops... Something went wrong!",
            });
          }
        }}
      >
        {({ errors, touched, isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex flex-col relative w-full space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>

                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-0 focus:border-[#F19B12] outline-none transition ${
                    errors.email && touched.email
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors?.email && touched?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#F19B12] focus:border-[#F19B12] outline-none transition ${
                      errors.password && touched.password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end mb-4">
                {" "}
                {/* Added margin-bottom */}
                <button
                  type="button"
                  onClick={() => router.push("/forget-password")}
                  className="text-sm font-medium text-[#F19B12] hover:text-[#d48a10] transition underline" // Added underline
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className={`w-full bg-[#F19B12] hover:bg-[#d48a10] text-white font-medium py-3 px-4 rounded-lg transition ${
                  isSubmitting || loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting || loading}
              >
                {loading
                  ? "Loading..."
                  : isSubmitting
                  ? "Logging in..."
                  : "Login"}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">or continue with</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className={`w-full flex items-center justify-center py-3 px-4 border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition ${
          googleLoading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {googleLoading ? (
          <span>Signing in...</span>
        ) : (
          <>
            <Image
              width={20}
              height={20}
              src={googleLogo.src}
              alt="Google Logo"
              className="w-5 h-5 mr-3"
            />
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </>
        )}
      </button>

      <div className="mt-8 text-center text-sm text-gray-600">
        {" "}
        {/* Increased margin-top */}
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#F19B12] hover:text-[#d48a10] transition underline" // Added underline
        >
          Sign up
        </Link>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default function LoginForm() {
  return <ClientLoginForm />;
}
