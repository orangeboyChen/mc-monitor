import MainClientPage from '@/app/main-client-page'
import getMinecraftInfo from '@/app/action'

// The page reads MC_INFO_FILE and the live exporter at request time, so it
// must never be statically prerendered at build time.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Home = async () => {
    const flags = {
        hasInfoFile: Boolean(process.env.MC_INFO_FILE),
        hasExporter: Boolean(process.env.MC_EXPORTER_URL),
        hasMod: Boolean(process.env.MOD_METRICS_URL),
        hasProm: Boolean(process.env.PROM_URL),
    }
    const data = flags.hasInfoFile || flags.hasExporter
        ? await getMinecraftInfo()
        : null
    return <MainClientPage initMinecraftInfo={data} flags={flags} />
}

export default Home
