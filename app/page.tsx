'use server';
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/card";
import {Link} from "@nextui-org/link";
import {Divider} from "@nextui-org/divider";
import {Image} from "@nextui-org/image";
import MainClientPage from "@/app/main-client-page";


export default async function Home() {
  return (
     <MainClientPage initOnlineUserData={[]}/>
  );
}
