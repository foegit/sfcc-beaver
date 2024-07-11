export type HookImplementation = {
    location: string;
    connected: boolean;
};

export type HookPoint = {
    name: string;
    implementation: HookImplementation[];
};

export type SFCCHookDefinition = {
    name: string;
    script: string;
};

export const systemHooks = [
    'dw.order.calculate',
    'dw.order.calculateShipping',
    'dw.order.calculateTax',
    'dw.system.request.onSession',
    'dw.system.request.onRequest',
];

export enum HookTypes {
    system,
    commerceApi,
    custom,
}

export function getHookType(hookName: string) {
    if (systemHooks.includes(hookName)) {
        return HookTypes.system;
    }

    if (hookName.startsWith('dw.ocapi')) {
        return HookTypes.commerceApi;
    }

    return HookTypes.custom;
}

export function normalizeScriptPath(path: string) {
    const relativePath = path.replace('~', './'); // ensure no "~"

    if (/.*\.js/.test(relativePath)) {
        return relativePath;
    }

    return `${relativePath}.js`;
}

export function sortHooks(hooks: HookPoint[], sortBy?: string) {
    function hookTypeToValue(hookType: HookTypes) {
        switch (hookType) {
            case HookTypes.system:
                return 10;
            case HookTypes.commerceApi:
                return 5;
            default:
                return 1;
        }
    }

    return [...hooks].sort((hook1, hook2) => {
        const hook1Value = hookTypeToValue(getHookType(hook1.name));
        const hook2Value = hookTypeToValue(getHookType(hook2.name));

        if (hook1Value === hook2Value) {
            return hook1.name.localeCompare(hook2.name);
        }

        return hook1Value > hook2Value ? -1 : 1;
    });
}
