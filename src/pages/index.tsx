import React from "react";
import Login from "./auth/login";
import { AuthLayout } from "@/components/layouts";

function Home() {
  return (
    <div>
      <AuthLayout>
        <Login />
      </AuthLayout>
    </div>
  );
}

export default Home;
