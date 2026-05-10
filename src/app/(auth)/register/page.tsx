import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Hesap Aç",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
