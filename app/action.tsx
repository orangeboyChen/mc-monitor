'use server'

export interface OnlineUserDataResponse {
    online: Array<string>,
    state?: string
}

export default async function getOnlineUserData(): Promise<OnlineUserDataResponse> {
    let res = await fetch('http://192.168.31.67:1880/endpoint/minecraft/online-user', {
        headers: {
            Authorization: 'Basic ' + Buffer.from('Smarthomefans:Smarthomefans').toString('base64')
        },
        next: {
            revalidate: 10
        }
    })
    return await res.json();
}
