import { APIClient, APIMapping } from '../http';
import { ParamList } from '../util/InternalTypes';
import { Entity, PagedResponse } from '@flowfact/types';

export class FullTextSearchService extends APIClient {
    constructor() {
        super(APIMapping.fullTextSearchService);
    }

    /**
     * Get the full search information by id.
     * @param schemaName
     * @param searchTerm
     * @param page
     * @param size
     * @param params
     */
    async search(schemaName: string, searchTerm: string, page = 1, size?: number, params: ParamList = {}) {
        return this.invokeApi<PagedResponse<Entity>>('/search/' + schemaName, 'GET', '', {
            queryParams: {
                page,
                size,
                searchTerm,
                ...params,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export default new FullTextSearchService();
