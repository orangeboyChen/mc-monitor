'use server'

import {RCONClient} from '@minecraft-js/rcon';
const client = new RCONClient('192.168.31.84', 'AdminAdmin');
export default async function getOnlineUserData(): Promise<Array<string>> {
    return [];
}