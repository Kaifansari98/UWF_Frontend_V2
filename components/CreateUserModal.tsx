"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { createUser, resetUserState } from "@/features/users/userSlice";
import { fetchAllUsers } from "@/features/users/GetUsersSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Camera, UserRound, Lock, Mail, ShieldCheck, Phone, MapPin, Loader2 } from "lucide-react";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="col-span-full flex items-center gap-2 mt-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function FieldError({ message }: { message: unknown }) {
  if (typeof message !== "string") return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export default function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success } = useSelector((state: RootState) => state.user);
  const loggedInUserRole = useSelector((state: RootState) => state.auth.user?.role);

  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const { ref: registerRef, ...registerRest } = register("profile_pic");

  const onSubmit = (data: Record<string, unknown>) => {
    const formData = new FormData();
    for (const key in data) {
      if (key === "profile_pic") {
        const files = data[key] as FileList;
        if (files?.[0]) formData.append("profile_pic", files[0]);
      } else if (data[key]) {
        formData.append(key, String(data[key]));
      }
    }
    dispatch(createUser(formData));
  };

  useEffect(() => {
    if (success) {
      toast.success("User created successfully.");
      reset();
      setValue("role", "");
      setAvatarPreview(null);
      dispatch(resetUserState());
      dispatch(fetchAllUsers());
      onClose();
    }
    if (error) {
      toast.error(error || "Something went wrong.");
      dispatch(resetUserState());
    }
  }, [success, error, dispatch, reset, setValue, onClose]);

  const handleClose = () => {
    reset();
    setValue("role", "");
    setShowPassword(false);
    setAvatarPreview(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="min-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">

        {/* Colored header banner */}
        <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 pt-6 pb-10 rounded-t-xl relative">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Create New User</DialogTitle>
            <DialogDescription className="text-blue-100 text-sm">
              Fill in the details below to add a new team member.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Avatar — overlapping the banner */}
        <div className="flex justify-center -mt-8 mb-2 px-6">
          <div className="relative">
            <div
              className="h-16 w-16 rounded-full border-4 border-white bg-muted overflow-hidden shadow-md cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-400">
                  <UserRound className="h-8 w-8" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm hover:bg-blue-600 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => {
                registerRef(el);
                fileInputRef.current = el;
              }}
              {...registerRest}
              onChange={(e) => {
                registerRest.onChange(e);
                handleFileChange(e);
              }}
            />
          </div>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 px-6 pb-6"
          encType="multipart/form-data"
        >
          {/* ── Account ── */}
          <SectionHeader icon={<Lock className="h-3.5 w-3.5" />} label="Account" />

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              placeholder="e.g. johndoe123"
              {...register("username", { required: "Username is required" })}
              className={errors.username ? "border-destructive focus-visible:ring-destructive/20" : ""}
            />
            <FieldError message={errors.username?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                {...register("password", { required: "Password is required" })}
                className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                className={`pl-9 ${errors.email ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-sm font-medium">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={(value) => setValue("role", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {loggedInUserRole === "super_admin" && (
                  <SelectGroup>
                    <SelectLabel>Admin Roles</SelectLabel>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                )}
                {loggedInUserRole === "admin" && (
                  <SelectGroup>
                    <SelectLabel>Admin Roles</SelectLabel>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                )}
                <SelectGroup>
                  <SelectLabel>Form Roles</SelectLabel>
                  <SelectItem value="form_creator">Form Generator</SelectItem>
                  <SelectItem value="evaluator">Request Evaluator</SelectItem>
                  <SelectItem value="approver">Request Approver</SelectItem>
                  <SelectItem value="disbursement_approver">Disbursement Approver</SelectItem>
                  <SelectItem value="case_closure">Case Closure</SelectItem>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* ── Personal ── */}
          <SectionHeader icon={<UserRound className="h-3.5 w-3.5" />} label="Personal" />

          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              placeholder="e.g. John Doe"
              {...register("full_name", { required: "Full name is required" })}
              className={errors.full_name ? "border-destructive focus-visible:ring-destructive/20" : ""}
            />
            <FieldError message={errors.full_name?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="age" className="text-sm font-medium">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Optional"
              {...register("age", { min: { value: 0, message: "Age cannot be negative" } })}
              className={errors.age ? "border-destructive focus-visible:ring-destructive/20" : ""}
            />
            <FieldError message={errors.age?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobile_no" className="text-sm font-medium">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="mobile_no"
                type="text"
                placeholder="+91 9876543210"
                {...register("mobile_no")}
                className="pl-9"
              />
            </div>
          </div>

          {/* ── Location ── */}
          <SectionHeader icon={<MapPin className="h-3.5 w-3.5" />} label="Location" />

          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-sm font-medium">Country</Label>
            <Input id="country" placeholder="e.g. India" {...register("country")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-sm font-medium">State</Label>
            <Input id="state" placeholder="e.g. Maharashtra" {...register("state")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-medium">City</Label>
            <Input id="city" placeholder="e.g. Mumbai" {...register("city")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pincode" className="text-sm font-medium">Pincode</Label>
            <Input id="pincode" placeholder="e.g. 400001" {...register("pincode")} />
          </div>

          {/* ── Footer actions ── */}
          <div className="col-span-full flex justify-end gap-2 pt-4 border-t mt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
