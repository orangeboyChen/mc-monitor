'use client'

import {useEffect, useState} from 'react';
import getData from "@/app/action";
import {Button} from '@nextui-org/button';
import {Input} from "@nextui-org/input";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {Divider} from "@nextui-org/divider";
import getOnlineUserData from "@/app/action";

const useMainClientPage = ({initOnlineUserData}: { initOnlineUserData: Array<string> }) => {
    const [onlineUserData, setOnlineUserData] = useState(initOnlineUserData);
    useEffect(() => {
        setInterval(async () => {
            const data = await getOnlineUserData();
            setOnlineUserData(data);
        }, 10 * 1000)
    }, []);
    return (
        <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                    <p className="text-md">在线玩家</p>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody>
                {
                    onlineUserData.length === 0 ? <p>没有人在线</p> :
                        onlineUserData.map((nickname, i) => {
                        return (
                            <p key={i}>{nickname}</p>
                        );
                    })
                }
            </CardBody>
        </Card>
    )
}

export default useMainClientPage;