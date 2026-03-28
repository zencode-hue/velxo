import { Suspense } from "react";
import SuccessClient from "./SuccessClient";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <CheckCircle size={32} className="text-green-400 animate-pulse" />
      </div>
    }>
      <SuccessClient />
    </Suspense>
  );
}
