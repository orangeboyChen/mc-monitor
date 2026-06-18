// Lightweight in-repo i18n. No external library, fully tree-shakeable.
// Supported locales: zh (default), en, ja.

export type Locale = 'zh' | 'en' | 'ja'

export const SUPPORTED_LOCALES: readonly Locale[] = ['zh', 'en', 'ja'] as const

export const LOCALE_LABEL: Record<Locale, string> = {
    zh: '中文',
    en: 'English',
    ja: '日本語',
}

export type Messages = {
    nav: {
        title: string
        themeLight: string
        themeDark: string
        language: string
    }
    server: {
        sectionTitle: string
        offline: string
        online: string
        nobodyOnline: string
        playersOnline: (n: number) => string
    }
    info: {
        sectionTitle: string
        version: string
        forge: string
        forgeDownload: string
        mod: string
        modDownload: string
        modUpdatedAt: (date: string) => string
    }
    metrics: {
        exporterTitle: string
        modTitle: string
        loading: string
        empty: string
        errorLoading: string
        retry: string
        gauge: string
        counter: string
        unknown: string
    }
    storage: {
        title: string
        searchPlaceholder: string
        topNTitle: (n: number) => string
        item: string
        amount: string
        network: string
        noData: string
        totalItems: (n: number) => string
    }
    history: {
        title: string
        subtitle: string
        range1h: string
        range6h: string
        range24h: string
        range7d: string
        notConfigured: string
        loadFailed: string
        noSeries: string
    }
    common: {
        refresh: string
        lastUpdated: (s: string) => string
        copy: string
        copied: string
    }
}

const zh: Messages = {
    nav: {
        title: 'Minecraft 监控',
        themeLight: '浅色',
        themeDark: '深色',
        language: '语言',
    },
    server: {
        sectionTitle: '服务器状态',
        offline: '服务器离线',
        online: '在线玩家',
        nobodyOnline: '当前没有人在线',
        playersOnline: (n) => `共 ${n} 人在线`,
    },
    info: {
        sectionTitle: '版本信息',
        version: 'Minecraft 版本',
        forge: 'Forge',
        forgeDownload: '下载 Forge',
        mod: 'Mod 整合包',
        modDownload: '下载整合包',
        modUpdatedAt: (date) => `更新于 ${date}`,
    },
    metrics: {
        exporterTitle: '服务器指标 (mc-exporter)',
        modTitle: 'Mod 指标',
        loading: '加载中…',
        empty: '没有可用指标',
        errorLoading: '加载指标失败',
        retry: '重试',
        gauge: '瞬时值',
        counter: '累计值',
        unknown: '未知',
    },
    storage: {
        title: '物流网络库存',
        searchPlaceholder: '搜索物品…',
        topNTitle: (n) => `库存 Top ${n}`,
        item: '物品',
        amount: '数量',
        network: '网络',
        noData: '没有库存数据',
        totalItems: (n) => `共 ${n} 个物品种类`,
    },
    history: {
        title: '历史趋势',
        subtitle: '来自 Prometheus 的时间序列',
        range1h: '近 1 小时',
        range6h: '近 6 小时',
        range24h: '近 24 小时',
        range7d: '近 7 天',
        notConfigured: '未配置 Prometheus（设置 PROM_URL 后可用）',
        loadFailed: '加载历史数据失败',
        noSeries: '没有数据',
    },
    common: {
        refresh: '刷新',
        lastUpdated: (s) => `更新于 ${s}`,
        copy: '复制',
        copied: '已复制',
    },
}

const en: Messages = {
    nav: {
        title: 'Minecraft Monitor',
        themeLight: 'Light',
        themeDark: 'Dark',
        language: 'Language',
    },
    server: {
        sectionTitle: 'Server status',
        offline: 'Server offline',
        online: 'Players online',
        nobodyOnline: 'Nobody is online right now',
        playersOnline: (n) => `${n} player${n === 1 ? '' : 's'} online`,
    },
    info: {
        sectionTitle: 'Build info',
        version: 'Minecraft version',
        forge: 'Forge',
        forgeDownload: 'Download Forge',
        mod: 'Modpack',
        modDownload: 'Download modpack',
        modUpdatedAt: (date) => `Updated on ${date}`,
    },
    metrics: {
        exporterTitle: 'Server metrics (mc-exporter)',
        modTitle: 'Mod metrics',
        loading: 'Loading…',
        empty: 'No metrics available',
        errorLoading: 'Failed to load metrics',
        retry: 'Retry',
        gauge: 'gauge',
        counter: 'counter',
        unknown: 'unknown',
    },
    storage: {
        title: 'Logistics network storage',
        searchPlaceholder: 'Search items…',
        topNTitle: (n) => `Top ${n} stored items`,
        item: 'Item',
        amount: 'Amount',
        network: 'Network',
        noData: 'No storage data',
        totalItems: (n) => `${n} distinct item${n === 1 ? '' : 's'}`,
    },
    history: {
        title: 'Historical trends',
        subtitle: 'Time series from Prometheus',
        range1h: 'Last 1 h',
        range6h: 'Last 6 h',
        range24h: 'Last 24 h',
        range7d: 'Last 7 d',
        notConfigured: 'Prometheus not configured (set PROM_URL to enable)',
        loadFailed: 'Failed to load historical data',
        noSeries: 'No data',
    },
    common: {
        refresh: 'Refresh',
        lastUpdated: (s) => `Updated ${s}`,
        copy: 'Copy',
        copied: 'Copied',
    },
}

const ja: Messages = {
    nav: {
        title: 'Minecraft モニター',
        themeLight: 'ライト',
        themeDark: 'ダーク',
        language: '言語',
    },
    server: {
        sectionTitle: 'サーバー状態',
        offline: 'サーバーはオフラインです',
        online: 'オンラインのプレイヤー',
        nobodyOnline: '現在オンラインのプレイヤーはいません',
        playersOnline: (n) => `${n} 人がオンライン`,
    },
    info: {
        sectionTitle: 'バージョン情報',
        version: 'Minecraft バージョン',
        forge: 'Forge',
        forgeDownload: 'Forge をダウンロード',
        mod: 'Mod パック',
        modDownload: 'Mod パックをダウンロード',
        modUpdatedAt: (date) => `更新日: ${date}`,
    },
    metrics: {
        exporterTitle: 'サーバーメトリクス (mc-exporter)',
        modTitle: 'Mod メトリクス',
        loading: '読み込み中…',
        empty: '利用可能なメトリクスがありません',
        errorLoading: 'メトリクスの読み込みに失敗しました',
        retry: '再試行',
        gauge: 'ゲージ',
        counter: 'カウンター',
        unknown: '不明',
    },
    storage: {
        title: '物流ネットワーク在庫',
        searchPlaceholder: 'アイテムを検索…',
        topNTitle: (n) => `在庫トップ ${n}`,
        item: 'アイテム',
        amount: '数量',
        network: 'ネットワーク',
        noData: '在庫データがありません',
        totalItems: (n) => `${n} 種類のアイテム`,
    },
    history: {
        title: '履歴トレンド',
        subtitle: 'Prometheus の時系列データ',
        range1h: '直近 1 時間',
        range6h: '直近 6 時間',
        range24h: '直近 24 時間',
        range7d: '直近 7 日',
        notConfigured: 'Prometheus が未設定です（PROM_URL を設定してください）',
        loadFailed: '履歴データの取得に失敗しました',
        noSeries: 'データがありません',
    },
    common: {
        refresh: '更新',
        lastUpdated: (s) => `${s} に更新`,
        copy: 'コピー',
        copied: 'コピーしました',
    },
}

export const MESSAGES: Record<Locale, Messages> = { zh, en, ja }

export const detectLocale = (input: string | null | undefined): Locale => {
    if (!input) return 'zh'
    const lower = input.toLowerCase()
    if (lower.startsWith('en')) return 'en'
    if (lower.startsWith('ja') || lower.startsWith('jp')) return 'ja'
    if (lower.startsWith('zh')) return 'zh'
    return 'zh'
}
