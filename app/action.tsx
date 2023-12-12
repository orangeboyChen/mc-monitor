'use server'

export default async function getOnlineUserData(): Promise<Array<string>> {
    let res = await fetch('http://192.168.31.67:1880/endpoint/minecraft/online-user', {
        headers: {
            Authorization: 'Basic ' + Buffer.from('Smarthomefans:Smarthomefans').toString('base64')
        }
    })
    let json = await res.json()
    return json['online'];
}