"use client";

import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/navigation";
import { ReqResetPassword } from "@/lib/actions/auth"; 
import { toast } from "sonner";
import bgImg from "@/assets/myImages/login.png";

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

  return (
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
        setError("");

        const emailError = validateEmail(values.email);
        if (emailError) {
          setErrors({ email: emailError });
          setSubmitting(false);
          return;
        }

        try {
          const response: any = await ReqResetPassword({
            email: values.email,
          });
            console.log(values.email)
            console.log("200")
            toast.success(response.message || "OTP sent!");
            router.push(
              `/verification?email=${encodeURIComponent(
                values.email.toString()
              )}`
            );
          
        } catch (err: any) {
          console.log("Error")
            toast.error(err?.message || "🚨Oops... Something went wrong!", {
              description: err?.response?.data?.message || err.message,
            });
          
        } finally {
          setSubmitting(false);
        }
      }}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ errors, touched, isSubmitting, handleSubmit }) => (
        <div className="h-screen w-screen px-4 flex flex-col justify-center items-center lg:flex-row pt-0 pt-0 overflow-x-hidden bg-gray-100 font-custom">
          <section className="w-full lg:w-[60vw] h-auto flex flex-col justify-center items-center">
            <Form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="text-center text-[40px] font-bold text-[#F19B12]">
            Lyalla and Lora
          </div>
              <div className="flex flex-col items-center space-y-1 lg:space-y-1 pb-12 pt-8 ">
                <h1 className="font-semibold leading-[56.96px] bold text-[24px] md:text-[36px] lg:text-[46px] text-center font-custom -tracking--2">
                  FIND YOUR ACCOUNT
                </h1>
                <p className="py-4 pb-8 w-[70%] md:text-lg lg:text-[18px] leading-[43.7px] tracking-[-2%] font-normal text-center decoration-0 text-[#696969]">
                  Enter the email address associated with your account, and we will send you a six digit OTP to your email address.
                </p>

                <div className="space-y-2 flex flex-col w-[400px]">
                <Field
                  name="email"
                  placeholder="Enter your email address"
                  className="h-[42px]  mb-[2px] py-4 px-6 rounded-[6.56px] border-[#F19B12] border-2 w-full text-sm ring-0 focus:ring-0 outline-none"
                />
                {errors.email && touched.email && (
                  <p className="text-red-500">{errors.email}</p>
                )}
                {isSubmitting ? (
                  <button
                    type="button"
                    className=" bg-[#F19B12] text-[#ffffff] py-2 rounded-md font-medium text-base"
                    disabled
                  >
                    Sending OTP...
                  </button>
                ) : (
                  <button
                    type="submit"
                    className=" bg-[#F19B12] py-2 rounded-md text-[#ffffff] font-medium text-base"
                    disabled={isSubmitting}
                  >
                    Continue
                  </button>
                )}
                </div>

                {error && <p className="text-red-500">{error}</p>}
              </div>
            </Form>
          </section>
          <div className="hidden lg:flex lg:w-[40vw] h-screen flex-col">
            <img
              src={bgImg.src}
              alt="Verification"
              className="object-cover w-full h-full rounded-l-[90px]"
            />
          </div>
        </div>
      )}
    </Formik>
  );
}

