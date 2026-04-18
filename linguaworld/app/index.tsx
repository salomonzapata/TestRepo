import { Redirect } from "expo-router";
import { useAppStore } from "@/lib/store";

export default function Index() {
  const session = useAppStore((s) => s.session);
  return <Redirect href={session ? "/(app)" : "/(auth)/login"} />;
}
