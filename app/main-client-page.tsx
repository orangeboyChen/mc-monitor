'use client'

import React, {useEffect, useState} from 'react';
import {Button} from '@nextui-org/button';
import {Input} from "@nextui-org/input";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {Divider} from "@nextui-org/divider";
import {Image} from "@nextui-org/image";
import {Link} from "@nextui-org/link";
import getOnlineUserData, {OnlineUserDataResponse} from "@/app/action";

const useMainClientPage = ({initOnlineUserData}: { initOnlineUserData: OnlineUserDataResponse }) => {
    const [onlineUserData, setOnlineUserData] = useState(initOnlineUserData)

    useEffect(() => {
        setInterval(async () => {
            const data = await getOnlineUserData();
            setOnlineUserData(data);
        }, 10 * 1000)
    }, []);
    return (
        <>
            <Card className="max-w-[400px]">
                <CardHeader className="flex gap-3">
                    <div className="flex flex-col">
                        <p className="text-md">
                        {
                            onlineUserData.state === 'unavailable' ? '服务器离线' : '在线玩家'
                        }
                        </p>
                    </div>
                </CardHeader>
                <Divider/>
                <CardBody>
                    {
                        onlineUserData.online.length === 0 ? <p>没有人在线</p> :
                            onlineUserData.online.map((nickname, i) => {
                                return (
                                    <p key={i}>{nickname}</p>
                                );
                            })
                    }
                </CardBody>
            </Card>
            <div style={{ height: 12 }}></div>
            <Card className="max-w-[400px]">
                <CardHeader className="flex gap-3">
                    <Image
                        alt="nextui logo"
                        height={40}
                        radius="sm"
                        src="https://static.wikia.nocookie.net/minecraft_zh_gamepedia/images/9/93/Grass_Block_JE7_BE6.png"
                        width={40}
                    />
                    <div className="flex flex-col">
                        <p className="text-md">Minecraft</p>
                        <p className="text-small text-default-500">1.20.1</p>
                    </div>
                </CardHeader>
                <Divider/>
                <CardBody>
                    <div style={ {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4
                    }}>
                        <div className="flex flex-col">
                            <p className="text-md">Forge</p>
                            <p className="text-small text-default-500">47.2.0</p>
                        </div>
                        <Link isBlock
                              showAnchorIcon
                              target={"_blank"}
                              href="https://files.minecraftforge.net/net/minecraftforge/forge/index_1.20.1.html">
                            下载Forge</Link>
                    </div>
                    <div style={ {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4
                    }}>
                        <div className="flex flex-col">
                            <p className="text-md">Mod整合包</p>
                            <p className="text-small text-default-500">1.0.0 更新于2023-12-11</p>
                        </div>
                        <Link isBlock
                              showAnchorIcon
                              target={"_blank"}
                              href="/mods-1.0.0-20231211.zip">
                            下载Mod整合包</Link>
                    </div>
                </CardBody>
            </Card>
        </>

    )
}

export default useMainClientPage;
