import { Captions } from '@flowfact/types';

export namespace NavigationTypes {
    export interface ACP {
        id: string;
        grantType: 'template' | 'group';
    }

    export interface Access {
        acps?: ACP[];
        hideFromCrm?: boolean;
    }

    export interface BaseItem {
        name: string;
        access?: Access;
        captions: Captions;
    }

    export interface Item extends BaseItem {
        type: 'REDIRECT' | 'EXTERNAL_REDIRECT';
        url: string;
    }

    export interface Section extends BaseItem {
        items: Item[];
    }

    export interface NavigationEntry extends BaseItem {
        icon: string;
        type: 'EXPANDABLE' | 'REDIRECT';
        url?: string;
        sections?: Section[];
    }

    export interface Navigation {
        entries: NavigationEntry[];
    }
}
