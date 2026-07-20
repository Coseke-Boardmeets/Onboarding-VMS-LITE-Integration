// frontend/src/app/register/page.tsx
import VisitorForm from "@/components/VisitorForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 dark:bg-slate-950">
      <div className="w-full max-w-lg">
        <VisitorForm />
      </div>
    </main>
  );
}