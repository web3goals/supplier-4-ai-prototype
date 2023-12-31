import AccountEarnings from "@/components/account/AccountEarnings";
import AccountProfile from "@/components/account/AccountProfile";
import Layout from "@/components/layout";
import { FullWidthSkeleton, ThickDivider } from "@/components/styled";
import { useRouter } from "next/router";

/**
 * Page with an account.
 */
export default function Account() {
  const router = useRouter();
  const { address } = router.query;

  return (
    <Layout maxWidth="sm">
      {address ? (
        <>
          <AccountProfile address={address.toString()} />
          <ThickDivider sx={{ my: 8 }} />
          <AccountEarnings address={address.toString()} />
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
