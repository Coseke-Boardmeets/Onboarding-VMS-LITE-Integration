// frontend/src/components/VisitorForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateVisitorPayload } from "@/types/visitor";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";

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
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to register visitor. Please try again."
      );
    }
  }

  return (
    <div className="w-full bg-white rounded-lg shadow p-8">
      <div className="mb-8">
        <p className="text-gray-600">Please fill in your details below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
        {/* Full Name input */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full name *
          </label>
          <Input
            id="fullName"
            placeholder="Jane Doe"
            {...register("fullName", { required: "Full name is required" })}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600">⚠ {errors.fullName.message}</p>
          )}
        </div>

        {/* Purpose of Visit input */}
        <div className="space-y-2">
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Purpose of visit *
          </label>
          <Input
            id="purpose"
            placeholder="e.g. Interview, Meeting, Delivery"
            {...register("purpose", { required: "Purpose is required" })}
          />
          {errors.purpose && (
            <p className="text-sm text-red-600">⚠ {errors.purpose.message}</p>
          )}
        </div>

        {/* Submit button — disable it while isSubmitting is true */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Registering…" : "Register visit"}
        </Button>
      </form>

      {/* Show a success message after successful registration */}
      {successMessage && (
        <div className="mb-6 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          ✓ {successMessage}
        </div>
      )}

      {/* Show an error message if the API call fails */}
      {errorMessage && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          ✕ {errorMessage}
        </div>
      )}

      <Link href="/" className="text-blue-600 hover:underline text-sm">
        ← Back to Dashboard
      </Link>
    </div>
  );
}