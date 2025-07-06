"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { useEffect } from "react";
import { createUser, resetUserState } from "@/features/users/userSlice";
import { Toaster, toast } from "react-hot-toast";

const roles = [
  "super_admin",
  "admin",
  "form_creator",
  "evaluator",
  "treasurer",
  "approver",
  "disbursement_approver",
  "case_closure",
];

export default function CreateUserPage() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success } = useSelector((state: RootState) => state.user);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: any) => {
    const formData = new FormData();
    for (const key in data) {
      if (key === "profile_pic" && data.profile_pic[0]) {
        formData.append("profile_pic", data.profile_pic[0]);
      } else if (data[key]) {
        formData.append(key, data[key]);
      }
    }
    dispatch(createUser(formData));
  };

  const handleReset = () => {
    reset();
    setValue("role", ""); // Explicitly reset select field
  };

  useEffect(() => {
    if (success) {
      toast.success("Congratulations, User has been created successfully.");
      reset();
      dispatch(resetUserState());
    }

    if (error) {
      toast.error(error || "Something went wrong.");
      dispatch(resetUserState());
    }
  }, [success, error, dispatch, reset]);

  return (
    <div className="h-full flex items-center justify-center p-4">
      {/* <Toaster position="top-right" /> */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-left tracking-tight">
          Create New User
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          encType="multipart/form-data"
        >
          <div className="space-y-2">
            <Label htmlFor="profile_pic" className="text-sm font-medium text-gray-700">
              Profile Picture
            </Label>
            <Input
              id="profile_pic"
              type="file"
              accept="image/*"
              {...register("profile_pic")}
              className="rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200"
            />
            <p className="text-xs text-gray-500">
              Upload a profile image (JPEG, PNG, max 2MB recommended).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              {...register("username", { required: "Username is required" })}
              className={`rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200 ${errors.username ? "border-red-500" : ""}`}
            />
            <p className="text-xs text-gray-500">
              Unique identifier for the user (e.g., johndoe123).
            </p>
            {errors.username?.message && typeof errors.username.message === "string" && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              type="text"
              {...register("full_name", { required: "Full name is required" })}
              className={`rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200 ${errors.full_name ? "border-red-500" : ""}`}
            />
            <p className="text-xs text-gray-500">
              Enter the user's complete name (e.g., John Doe).
            </p>
            {errors.full_name?.message && typeof errors.full_name.message === "string" && (
              <p className="text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                className={`rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200 pr-10 ${errors.password ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Must be at least 8 characters, including a number and a symbol.
            </p>
            {errors.password?.message && typeof errors.password.message === "string" && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => setValue("role", value)}>
              <SelectTrigger className="w-full rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {role.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Select the user's role based on their responsibilities.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" } })}
              className={`rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200 ${errors.email ? "border-red-500" : ""}`}
            />
            <p className="text-xs text-gray-500">
              Enter a valid email address (e.g., user@example.com).
            </p>
            {errors.email?.message && typeof errors.email.message === "string" && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium text-gray-700">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              {...register("age", { min: { value: 0, message: "Age cannot be negative" } })}
              className={`rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200 ${errors.age ? "border-red-500" : ""}`}
            />
            <p className="text-xs text-gray-500">
              Enter the user's age (optional, must be a positive number).
            </p>
            {errors.age?.message && typeof errors.age.message === "string" && (
              <p className="text-xs text-red-500">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">
              Country
            </Label>
            <Input
              id="country"
              type="text"
              {...register("country")}
              className="rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200"
            />
            <p className="text-xs text-gray-500">
              Enter the user's country (e.g., India, USA).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium text-gray-700">
              State
            </Label>
            <Input
              id="state"
              type="text"
              {...register("state")}
              className="rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5 transition-colors duration-200"
            />
            <p className="text-xs text-gray-500">
              Enter the user's state or province (e.g., Maharashtra, California).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">
              City
            </Label>
            <Input
              id="city"
              type="text"
              {...register("city")}
              className="rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200"
            />
            <p className="text-xs text-gray-500">
              Enter the user's city (e.g., Mumbai, New York).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">
              Pincode
            </Label>
            <Input
              id="pincode"
              type="text"
              {...register("pincode")}
              className="rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200"
            />
            <p className="text-xs text-gray-500">
              Enter the postal code (e.g., 400001, 10001).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile_no" className="text-sm font-medium text-gray-700">
              Mobile Number
            </Label>
            <Input
              id="mobile_no"
              type="text"
              {...register("mobile_no")}
              className="rounded-lg border-gray-300 focus:border-[#025aa5] focus:ring-[#025aa5] transition-colors duration-200"
            />
            <p className="text-xs text-gray-500">
              Enter the mobile number with country code (e.g., +91 9876543210).
            </p>
          </div>

          <div className="col-span-full flex justify-start mt-6 gap-2 flex-wrap">
            <Button
              type="button"
              onClick={handleReset}
              className="px-8 bg-white hover:bg-white text-black font-semibold py-6 rounded-lg transition-colors duration-200 tracking-wide border-[1px] border-[#025aa5]"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 bg-[#025aa5] hover:bg-[#025aa5] text-white font-semibold py-6 rounded-lg transition-colors duration-200 tracking-wide border-[1px] border-zinc-900"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}