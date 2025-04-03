"use client";

import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Toaster } from "sonner";

function validateEmail(value: string) {
  let error;
  if (!value) {
    error = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    error = "Invalid email address";
  }
  return error;
}

export default function ClientLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  // Helper function to safely extract error messages
  const getErrorMessage = (err: any): string => {
    // Check if message is an object, and if so return a generic message
    if (err?.response?.data?.message && typeof err.response.data.message === 'object') {
      return "Server error occurred. Please try again later.";
    }
    
    // Otherwise try to get a string message from various places
    return (
      (typeof err?.response?.data?.message === 'string' ? err.response.data.message : null) ||
      err?.message ||
      "Unknown error occurred"
    );
  };

  return (
    <div className="w-full">
      <Formik
        initialValues={{
          email: "",
        }}
        validate={(values) => {
          const errors: { email?: string } = {};
          const emailError = validateEmail(values.email);
          if (emailError) {
            errors.email = emailError;
          }
          return errors;
        }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            setError("");
            const emailError = validateEmail(values.email);
            
            if (emailError) {
              setErrors({ email: emailError });
              setSubmitting(false);
              return;
            }

            console.log("Submitting email:", values.email);
            
            const response = await axios.post("/api/send-otp-register", {
              email: values.email,
            }, {
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            // Log the response for debugging
            console.log("API Response:", response);
            
            if (response.status === 200) {
              // Make sure we're accessing a string
              const successMessage = typeof response.data?.message === 'string' 
                ? response.data.message 
                : "OTP sent!";
                
              toast.success(successMessage);
              router.push(
                `./verification?email=${encodeURIComponent(values.email)}`
              );
            }
          } catch (err: any) {
            console.error("Error during OTP send:", err);
            
            // Debug the error structure
            console.log("Error response:", err?.response?.data);
            
            const errorMessage = getErrorMessage(err);
            
            if (err?.response?.data?.message === "Verified user found with this email") {
              toast.success("Verified user found, redirecting to login.");
              router.push(`/login?email=${encodeURIComponent(values.email)}`);
            } else {
              toast.error("Something went wrong!", {
                description: errorMessage,
              });
              setError(errorMessage);
            }
          } finally {
            setSubmitting(false);
          }
        }}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ errors, touched, isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <div className="mt-8 flex flex-col space-y-2 relative w-full">
              <label
                htmlFor="email"
                className=" text-black text-[17px] leading-[20px] font-semibold"
              >
                Email address <span className="text-red-500">*</span>
              </label>

              <Field
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                className="h-[42px] mb-[2px] py-4 px-6 rounded-[6.56px] border-[#F19B12] border-2 w-full text-sm ring-0 focus:ring-0 outline-none"
              />
              
              {errors.email && touched.email ? (
                <div className="text-red-500">{String(errors.email)}</div>
              ) : null}
              
              <button
                type="submit"
                className="bg-[#F19B12] text-white font-medium text-base py-2 px-4 rounded mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up..." : "Continue"}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="py-3 flex items-center justify-center">
        <div className="border-t-[1px] border-solid border-white flex-grow"></div>
        <span className="mx-2 text-[#ffffff] text-base font-normal">Or</span>
        <div className="border-t-[1px] border-solid border-white flex-grow"></div>
      </div>

      {error ? <p className="text-red-500">{error}</p> : null}
      <Toaster position="top-right"/>
    </div>
  );
}