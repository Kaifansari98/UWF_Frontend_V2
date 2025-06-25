"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { updateUser } from "@/features/users/GetUsersSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ConfirmModal from "./ConfirmModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import gsap from "gsap";
import { toast } from "react-hot-toast";

interface EditUserModalProps {
  user: any;
  onClose: () => void;
}

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

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);    

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    gsap.fromTo(
        "#edit-user-modal",
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      
      gsap.fromTo(
        "#edit-user-card",
        { scale: 1.15, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.7)" }
      );      

    // Pre-fill values
    Object.keys(user).forEach((key) => setValue(key, user[key]));
  }, [user, setValue]);

    const handleConfirmedUpdate = () => {
    const formData = new FormData();
    for (const key in watch()) {
        const value = watch(key);
        if (key === "profile_pic" && value && value[0]) {
        formData.append("profile_pic", value[0]);
        } else if (value !== undefined) {
        formData.append(key, value);
        }
    }

    dispatch(updateUser({ id: user.id, formData })).then(() => {
        toast.success("User updated successfully.");
        onClose();
    });

    setShowConfirm(false);
    };

const onSubmit = () => {
  setShowConfirm(true);
};


  return (
    <div
      id="edit-user-modal"
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
    >
      <div id="edit-user-card" className="bg-white w-full max-w-3xl rounded-xl p-8 shadow-xl relative">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit User</h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-1">
            <Label htmlFor="profile_pic">Profile Picture</Label>
            <Input id="profile_pic" type="file" {...register("profile_pic")} />
            <p className="text-xs text-gray-500">
              Upload a profile image (JPEG, PNG, max 2MB recommended).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username", { required: true })} />
            <p className="text-xs text-gray-500">
              Unique identifier for the user (e.g., johndoe123).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name", { required: true })} />
            <p className="text-xs text-gray-500">
              Enter the user's complete name (e.g., John Doe).
            </p>
          </div>

          <div className="space-y-1 relative">
            <Label htmlFor="password">Password</Label>
            <Input
                id="password"
                type="password"
                placeholder="•••••••"
                {...register("password")}
                />
                <p className="text-xs text-gray-500">
                Password is hidden and cannot be viewed. You can change it here.
                </p>
            {/* <button
              type="button"
              className="text-xs text-blue-600 absolute right-2 top-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button> */}
          </div>

          <div className="space-y-1">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => setValue("role", value)}>
              <SelectTrigger>
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

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            <p className="text-xs text-gray-500">
              Enter a valid email address (e.g., user@example.com).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" {...register("age")} />
            <p className="text-xs text-gray-500">
              Enter the user's age (optional, must be a positive number).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
            <p className="text-xs text-gray-500">
              Enter the user's country (e.g., India, USA).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
            <p className="text-xs text-gray-500">
              Enter the user's state or province (e.g., Maharashtra, California).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
            <p className="text-xs text-gray-500">
              Enter the user's city (e.g., Mumbai, New York).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" {...register("pincode")} />
            <p className="text-xs text-gray-500">
              Enter the postal code (e.g., 400001, 10001).
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mobile_no">Mobile No</Label>
            <Input id="mobile_no" {...register("mobile_no")} />
            <p className="text-xs text-gray-500">
              Enter the mobile number with country code (e.g., +91 9876543210).
            </p>
          </div>

          <div className="col-span-full flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="bg-[#fff] text-black border-[1px] border-zinc-500 px-10">
              Cancel
            </Button>
            <Button type="submit" className="bg-[#292929] text-white border-[1px] border-zinc-800 px-10">
              Update
            </Button>
          </div>
        </form>
      </div>    
      {showConfirm && (
  <ConfirmModal
    title="Update User Details"
    description="Are you sure you want to update this user's credentials?"
    onConfirm={handleConfirmedUpdate}
    onCancel={() => setShowConfirm(false)}
  />
)}
    </div>
  );
}
