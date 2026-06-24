// frontend/src/app/register/page.tsx
import VisitorForm from "@/components/VisitorForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Register a Visitor</h1>
      <VisitorForm />
    </main>
  );
}