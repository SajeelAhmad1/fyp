import React from "react";
import LoginPic from "@/assets/images/login-page.png";
import PasswordPic from "@/assets/images/password.png";
import verifyPic from "@/assets/myImages/otp.png";
import RegisterP from "@/assets/images/login-bg.jpeg";
import Login from "@/assets/myImages/loginbg.png";
import Image from "next/image";

import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();

  function layoutPicture() {
    let imgUrl = "";
    switch (pathname) {
      case "/password":
        imgUrl = `${PasswordPic.src}`;
        break;

      case "/register":
        imgUrl = `${RegisterP.src}`;
        break;
      case "/login":
        imgUrl = `${Login.src}`;
        break;

      case "/verification":
        imgUrl = `${verifyPic.src}`;
        break;

      case "/reset-password":
        imgUrl = `${LoginPic.src}`;
        break;

        case "/verify":
          imgUrl = `${verifyPic.src}`;
          break;

      default:
        imgUrl = `${LoginPic.src}`;
        break;
    }
    return imgUrl;
  }

  return (
    <div className="h-screen bg-[#F7F9FF]">
      <div className="flex justify-center w-full md:justify-between items-center h-full">
        <div className="flex-1 px-3 w-full flex flex-col justify-center items-center h-full">
          {children}
        </div>
        <div className=" h-full max-w-[445px] lg:max-w-[545px] xl:max-w-[630px] w-full hidden md:block">
          <Image
            src={layoutPicture()}
            alt="layout-picture"
            width={500}
            height={500}
            className="w-full h-full object-cover rounded-l-[90px]"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
