import { redirect } from "next/navigation";

// Redirect old order URLs to new invoice URLs
export default function OrderPage({ params }: { params: { id: string } }) {
  redirect(`/invoice/${params.id}`);
}
