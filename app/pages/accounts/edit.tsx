import { ProfileUriData } from "@/types";
import { stringToAddress } from "@/utils/converters";
import AccountEditProfileForm from "components/account/AccountEditProfileForm";
import Layout from "components/layout";
import { FullWidthSkeleton } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import useError from "hooks/useError";
import useIpfs from "hooks/useIpfs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { chainToSupportedChainProfileContractAddress } from "utils/chains";
import { zeroAddress } from "viem";
import { useAccount, useContractRead, useNetwork } from "wagmi";

/**
 * Page to edit account profile.
 */
export default function EditAccountProfile() {
  const router = useRouter();
  const { handleError } = useError();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { loadJsonFromIpfs } = useIpfs();
  const [profileData, setProfileData] = useState<
    ProfileUriData | null | undefined
  >();
  const [face, setFace] = useState<string | undefined>();

  /**
   * Contract states
   */
  const {
    status: contractReadStatus,
    error: contractReadError,
    data: contractReadData,
  } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [stringToAddress(address) || zeroAddress],
  });

  /**
   * Load profile data from IPFS
   */
  useEffect(() => {
    if (address && contractReadStatus === "success") {
      if (contractReadData) {
        loadJsonFromIpfs(contractReadData)
          .then((result) => setProfileData(result))
          .catch((error) => handleError(error, true));
      } else {
        setProfileData(null);
      }
    }
    if (address && contractReadStatus === "error" && contractReadError) {
      setProfileData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, contractReadStatus, contractReadError, contractReadData]);

  /**
   * Check face value
   */
  useEffect(() => {
    const face = localStorage.getItem("face");
    if (face) {
      setFace(face);
    } else {
      router.push("/accounts/guard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout maxWidth="xs">
      {profileData !== undefined && face !== undefined ? (
        <AccountEditProfileForm profileData={profileData} />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
