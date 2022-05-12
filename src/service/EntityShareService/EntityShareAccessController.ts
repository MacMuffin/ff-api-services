import { APIClient, APIMapping } from '../../http';
import { EntityShareServiceTypes } from './EntityShareService.Types';
import { PagedResponse } from '@flowfact/types';

export class EntityShareAccessController extends APIClient {
    constructor() {
        super(APIMapping.entityShareService);
    }

    /**
     * Fetches the list of imported entities for the company of current user
     * @param page
     * @param size
     */
    async fetchImportedEntities(page = 0, size: number = 10) {
        return this.invokeApiWithErrorHandling<PagedResponse<EntityShareServiceTypes.ImportedEntity>>('/access', 'GET', { page, size });
    }

    /**
     * Fetches the list of companies that have been granted access to the entity with the token
     * @param token
     */
    async fetchCompaniesWithAccess(token: string) {
        return this.invokeApiWithErrorHandling<EntityShareServiceTypes.SharedEntityCompanyWithAccessList>(`/access/${token}`, 'GET');
    }

    /**
     * Grants access to the entity with given token
     * @param token
     */
    async importEntity(token: string) {
        return this.invokeApiWithErrorHandling('/access', 'POST', { token });
    }

    /**
     * Revokes the access to the entity for given company
     * @param companyId
     * @param token
     */
    async deactivateAccess(companyId: string, token: string) {
        return this.invokeApiWithErrorHandling('/access/deactivate', 'POST', { companyId, token });
    }

    /**
     * Restores the access to the entity for given company
     * @param companyId
     * @param token
     */
    async reactivateAccess(companyId: string, token: string) {
        return this.invokeApiWithErrorHandling('/access/reactivate', 'POST', { companyId, token });
    }
}
