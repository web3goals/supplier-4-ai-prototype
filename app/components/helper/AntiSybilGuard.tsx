import { useRouter } from "next/router";
import { Antibot } from "zkme-antibot-component";

/**
 * A component that checks a user's face before editing their profile
 */
export default function AntiSybilGuard() {
  const router = useRouter();

  function verifySuccess(face: any) {
    localStorage.setItem("face", face);
    router.push(`/accounts/edit`);
  }
  return <Antibot isOpen={true} verifySuccess={verifySuccess} />;
}
