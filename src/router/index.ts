import { createRouter, createWebHistory } from "vue-router";
import RouterService from "./routerService";
import { EnvUtils } from "@/utils/envUtils";

let svc = new RouterService();
const subDomain = EnvUtils.getRouterPath();
const router = createRouter({
    history: createWebHistory(subDomain),
    routes: [...svc.getRoutes()],
});

export default router;