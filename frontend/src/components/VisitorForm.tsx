// frontend/src/components/VisitorForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateVisitorPayload } from "@/types/visitor";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import Image from "next/image";

// Import MUI icons for details
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function VisitorForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateVisitorPayload>();

  async function onSubmit(data: CreateVisitorPayload) {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await apiClient.post("/visitors", data);
      setSuccessMessage("Visitor registered successfully!");
      reset();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to register visitor. Please try again.",
      );
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-350 bg-white shadow-xl dark:border-slate-800/40 dark:bg-slate-900">
      {/* Visual Header Decoration (Coseke Blue-to-Red Gradient) */}
      <div className="bg-gradient-to-r from-blue-700 to-red-600 px-8 py-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white p-1 border border-blue-500 shadow-sm overflow-hidden">
            <Image
              src="/coseke_logo.png"
              alt="Coseke Logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Visitor Registration
            </h2>
            <p className="text-xs text-indigo-50 mt-0.5 font-semibold">
              Fill in details below to sign in a new guest.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          action="javascript:void(0)"
          className="space-y-5 mb-6"
        >
          {/* Full Name input */}
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="block text-sm font-extrabold text-slate-905 dark:text-slate-100"
            >
              Full name <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700 dark:text-slate-355" />
              <Input
                id="fullName"
                placeholder="Jane Doe"
                className={`pl-10 pr-4 py-2 border-slate-350 focus:ring-2 focus:ring-blue-600 rounded-xl dark:border-slate-800 dark:bg-slate-950/70 text-slate-955 dark:text-white ${
                  errors.fullName ? "border-rose-400 focus:ring-rose-500" : ""
                }`}
                {...register("fullName", { required: "Full name is required" })}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-rose-700 dark:text-rose-450 flex items-center mt-1 font-bold">
                <ErrorIcon className="h-3.5 w-3.5 mr-1" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Purpose of Visit input */}
          <div className="space-y-2">
            <label
              htmlFor="purpose"
              className="block text-sm font-extrabold text-slate-905 dark:text-slate-100"
            >
              Purpose of visit <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <AssignmentIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700 dark:text-slate-355" />
              <Input
                id="purpose"
                placeholder="e.g. Interview, Board Meeting, Delivery"
                className={`pl-10 pr-4 py-2 border-slate-350 focus:ring-2 focus:ring-blue-600 rounded-xl dark:border-slate-800 dark:bg-slate-955/70 text-slate-955 dark:text-white ${
                  errors.purpose ? "border-rose-400 focus:ring-rose-500" : ""
                }`}
                {...register("purpose", { required: "Purpose is required" })}
              />
            </div>
            {errors.purpose && (
              <p className="text-xs text-rose-700 dark:text-rose-450 flex items-center mt-1 font-bold">
                <ErrorIcon className="h-3.5 w-3.5 mr-1" />
                {errors.purpose.message}
              </p>
            )}
          </div>

          {/* Submit button — disable it while isSubmitting is true */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold shadow-md shadow-blue-700/20 py-2.5 rounded-xl transition-all duration-200 mt-2"
          >
            {isSubmitting ? "Registering..." : "Register & Queue Visitor"}
          </Button>
        </form>

        {/* Show a success message after successful registration */}
        {successMessage && (
          <div className="mb-6 flex items-center space-x-2 rounded-xl bg-emerald-100 border border-emerald-300 p-4 text-sm text-emerald-950 dark:bg-emerald-955/20 dark:border-emerald-900/30 dark:text-emerald-400 animate-fadeIn font-semibold">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Show an error message if the API call fails */}
        {errorMessage && (
          <div className="mb-6 flex items-center space-x-2 rounded-xl bg-rose-100 border border-rose-300 p-4 text-sm text-rose-955 dark:bg-rose-955/20 dark:border-rose-900/30 dark:text-rose-400 animate-fadeIn font-semibold">
            <ErrorIcon className="h-5 w-5 text-rose-650 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-center border-t border-slate-350 dark:border-slate-800/60 pt-4">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-850 dark:text-blue-450 dark:hover:text-blue-350 transition-colors"
          >
            <ArrowBackIcon className="h-3.5 w-3.5 mr-1.5" />
            Back to Reception Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
