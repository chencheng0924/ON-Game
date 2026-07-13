import GameLayout from "@/views/layout/game/GameLayout.vue"

class RouterService {
    constructor() { }
    private _ignoreFile: string[] = [
        '/src/views/pages/AIPlatform/AIAgentEdit.vue',
        '/src/views/pages/F1Chat/F1Chat.vue',
        '/src/views/pages/Games/CardGuess.vue',
        '/src/views/pages/Games/CoinCatch.vue',
        '/src/views/pages/Games/GameHub.vue',
        '/src/views/pages/Games/WineGlass.vue',
        '/src/views/pages/Games/Pinball.vue',
        '/src/views/pages/Games/BoilCatch.vue',
        '/src/views/pages/Games/MbtiQuiz.vue',
    ];


    getParentFolerName(path: string): string {
        let folderName: string[] = path.split("/");
        if (path.length < 2)
            return "";

        let name = folderName[folderName.length - 2];
        return name;
    }
    getLastFileName(path: string): string {
        let names = path.match(/\/([^/]+)\.vue$/);
        if (names.length < 2)
            return "";
        let fileName = names[1];
        return fileName;
    }
    private getPathRoutes() {
        const self = this;
        const routeModules = import.meta.glob('/src/views/pages/*/*.vue')
        const pages = Object.keys(routeModules)
            .filter(x => self._ignoreFile.includes(x) == false)
            .map(pathTemp => {

                const name = this.getLastFileName(pathTemp);

                return {
                    path: `/${name}/:data(.*)*`,
                    name: name,
                    meta: { layout: GameLayout },
                    component: routeModules[pathTemp],

                }
            });
        return pages;
    }

    getRoutes(): any {
        let otherPaths = this.getPathRoutes();
        const routes = [
            {
                path: '/',
                name: 'GameHub',
                meta: { layout: GameLayout },
                component: () => import('@/views/pages/Games/GameHub.vue'),
            },
            {
                path: '/boilCatch',
                name: 'BoilCatch',
                meta: { layout: GameLayout },
                component: () => import('@/views/pages/Games/BoilCatch.vue'),
            },
            {
                path: '/mbtiQuiz',
                name: 'MbtiQuiz',
                meta: { layout: GameLayout },
                component: () => import('@/views/pages/Games/MbtiQuiz.vue'),
            },
            // 舊遊戲保留路由但不在選單顯示，方便之後恢復
            {
                path: '/wineGlass',
                name: 'WineGlass',
                meta: { layout: GameLayout },
                component: () => import('@/views/pages/Games/WineGlass.vue'),
            },
            {
                path: '/coinCatch',
                name: 'CoinCatch',
                meta: { layout: GameLayout },
                component: () => import('@/views/pages/Games/CoinCatch.vue'),
            },
            {
                path: '/pinball',
                name: 'Pinball',
                meta: { layout: GameLayout },
                component: () => import('@/views/pages/Games/Pinball.vue'),
            },
            {
                path: '/cardGuess',
                name: 'CardGuess',
                meta: { layout: GameLayout },
                component: () => import('@/views/pages/Games/CardGuess.vue'),
            },
            ...otherPaths,

        ];

        return routes;
    }
}

export default RouterService;
