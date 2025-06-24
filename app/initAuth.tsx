  "use client";

  import { useEffect } from "react";
  import { useDispatch } from "react-redux";
  import { AppDispatch } from "@/lib/store";
  import { rehydrateAuth } from "@/features/auth/authSlice";
  import apiClient from "@/utils/apiClient";

  export default function InitAuth() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (token) {
        apiClient
          .get("/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            const user = res.data.user;
            if (user) {
              dispatch(rehydrateAuth({ token, user }));
              localStorage.setItem("user", JSON.stringify(user)); // keep in sync
            }
          })
          .catch((err) => {
            console.error("Token invalid or expired:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          });
      }
    }, [dispatch]);

    return null;
  }
