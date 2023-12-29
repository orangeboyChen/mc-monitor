'use server'

import {access} from "fs";

export interface MinecraftInfoResponse {
    online: Array<string>,
    state?: string,
    info: MinecraftInfo
}

export interface MinecraftInfo {
    version: string,
    forge: {
        version: string,
        downloadUrl: string,
    }
    mod: {
        version: string,
        updateTime: string,
        downloadUrl: string,
        downloadTip?: string,
    }
}


let lastRequestTimestamp = 0
const refreshInterval = 10 * 1000
let cacheResponse: MinecraftInfoResponse | undefined

export default async function getMinecraftInfo(): Promise<MinecraftInfoResponse> {
    const now = (new Date()).getTime();
    if (now - lastRequestTimestamp <= refreshInterval && cacheResponse != null) {
        return cacheResponse
    }

    let res = await fetch('http://192.168.31.67:1880/endpoint/minecraft/info', {
        headers: {
            Authorization: 'Basic ' + Buffer.from('Smarthomefans:Smarthomefans').toString('base64')
        },
        cache: 'no-store'
    })
    const data = await res.json();
    cacheResponse = data
    lastRequestTimestamp = now
    return data
}
