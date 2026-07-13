//定義Storage Key
class StorageKeys {
    public recently_agents: string = 'RecentlyAgents' // login access token
}

enum StorageType {
    l = 'localStorage',
    s = 'sessionStorage'
}

class MaasStorage {
    public storage: Storage
    constructor(type: StorageType) {
        this.storage = type === StorageType.l ? window.localStorage : window.sessionStorage
    }
    public set(key: string, value: any) {
        const data = JSON.stringify(value)
        this.storage.setItem(key, data)
    }
    public get(key: string) {
        const value = this.storage.getItem(key)
        if (value) {
            return JSON.parse(value)
        }
    }
    public delete(key: string) {
        this.storage.removeItem(key)
    }
    public clear() {
        this.storage.clear()
    }
}

class RecentlyAgentsLS {
    public recentlyAgents: Record<string, any[]>
    constructor() {
        this.recentlyAgents = LStorage.get(GetStorageKeys.recently_agents) || {}
    }
    public setData(item?: any) {
        if (!item?.tenantId) 
        return this;
        const isPlainObject = typeof this.recentlyAgents === 'object' && this.recentlyAgents !== null && !Array.isArray(this.recentlyAgents)
        if (!isPlainObject) {
            this.recentlyAgents = {}
            LStorage.delete(GetStorageKeys.recently_agents)
        }
        if(this.recentlyAgents[item.tenantId]){
            if(this.recentlyAgents[item.tenantId].length < 3){
                this.recentlyAgents[item.tenantId].unshift(item)
            }else{
                this.recentlyAgents[item.tenantId].pop()
                this.recentlyAgents[item.tenantId].unshift(item)
            }
        }else{
            (this.recentlyAgents[item.tenantId] ??= []).push({ ...item })
        }

        LStorage.set(GetStorageKeys.recently_agents, this.recentlyAgents)
        return this
    }
}

const LStorage = new MaasStorage(StorageType.l)
const SStorage = new MaasStorage(StorageType.s)
const GetStorageKeys = new StorageKeys()
export { LStorage, SStorage, GetStorageKeys, RecentlyAgentsLS }