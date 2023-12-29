'use client'

import React, {useEffect, useState} from 'react';
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {Divider} from "@nextui-org/divider";
import {Image} from "@nextui-org/image";
import {Link} from "@nextui-org/link";
import getMinecraftInfo, {MinecraftInfoResponse} from "@/app/action";

export const revalidate = 10;
const useMainClientPage = ({initMinecraftInfo}: { initMinecraftInfo: MinecraftInfoResponse }) => {
    const [data, setData] = useState(initMinecraftInfo)

    useEffect(() => {
        setInterval(async () => {
            const data = await getMinecraftInfo();
            setData(data);
        }, 10 * 1000)
    }, []);
    return (
        <>
            <Card className="max-w-[400px]">
                <CardHeader className="flex gap-3">
                    <div className="flex flex-col">
                        <p className="text-md">
                        {
                            data.state === 'unavailable' ? '服务器离线' : '在线玩家'
                        }
                        </p>
                    </div>
                </CardHeader>
                <Divider/>
                <CardBody>
                    {
                        data.online.length === 0 ? <p>没有人在线</p> :
                            data.online.map((nickname, i) => {
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
                        <p className="text-small text-default-500">{ data.info.version }</p>
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
                            <p className="text-small text-default-500">{ data.info.forge.version }</p>
                        </div>
                        <Link isBlock
                              showAnchorIcon
                              target={"_blank"}
                              href={ data.info.forge.downloadUrl }>
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
                            <p className="text-small text-default-500">{ data.info.mod.version } 更新于{ data.info.mod.updateTime }</p>
                        </div>
                        <Link isBlock
                              showAnchorIcon
                              target={"_blank"}
                              href={ data.info.mod.downloadUrl }>
                            <div style={{
                                textAlign: "right"
                            }}>
                                <p>下载Mod整合包</p>
                                {
                                    data.info.mod.downloadTip ? <p style={{ fontSize: "small" }}>{ data.info.mod.downloadTip }</p> : <></>
                                }
                            </div>

                        </Link>
                    </div>
                </CardBody>
            </Card>
        </>

    )
}

export default useMainClientPage;
