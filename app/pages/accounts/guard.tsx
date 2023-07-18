import dynamic from "next/dynamic";

/**
 * Page to check user's face
 */
export default function EditAccountProfileGuard() {
  /**
   * Documentation - https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading
   */
  const DynamicAntiSybilGuard = dynamic(
    () => import("../../components/helper/AntiSybilGuard"),
    {
      loading: () => <p>Loading...</p>,
      ssr: false,
    }
  );

  return <DynamicAntiSybilGuard />;
}
