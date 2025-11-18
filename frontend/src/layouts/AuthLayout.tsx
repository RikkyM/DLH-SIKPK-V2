import type { ReactNode } from "react";
import bg from "@/assets/img/background.jpg";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="h-dvh w-full flex items-center justify-center p-5">
      <img
        src={bg}
        alt="background"
        className="h-full object-cover absolute w-full"
      />
      {children}
    </section>
  );
};

export default AuthLayout;
