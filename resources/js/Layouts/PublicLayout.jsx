import { Head } from "@inertiajs/react";
import GlobalLoader from "@/Components/GlobalLoader";
import FlashToast from "@/Components/Shared/FlashToast";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";

export default function PublicLayout({ title = "Latin Terra", children }) {
  const show = useGlobalLoader();

  return (
    <>
      <Head title={title} />
      <GlobalLoader show={show} />
      <FlashToast />
      <div className="lt-public min-h-screen flex flex-col bg-[#f4f7fb] text-slate-900">{children}</div>
    </>
  );
}
