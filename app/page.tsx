'use server';
import MainClientPage from "@/app/main-client-page";
import getMinecraftInfo from "@/app/action";


export default async function Home() {
  const data = await getMinecraftInfo();
  return (
     <MainClientPage initMinecraftInfo={data}/>
  );
}
