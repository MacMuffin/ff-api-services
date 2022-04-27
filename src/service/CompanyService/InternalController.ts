import { APIClient, APIMapping } from '../../http';
import { CompanyServiceTypes } from './CompanyService.Types';

export class InternalController extends APIClient {
    constructor() {
        super(APIMapping.companyService);
    }

    /**
     * fetch a company by its id
     * @param companyId
     */
    async fetchCompanyById(companyId: CompanyServiceTypes.ID) {
        return this.invokeApiWithErrorHandling<CompanyServiceTypes.Company>(`/internal/company/${companyId}`, 'GET', undefined);
    }

    /**
     * start trial
     * @deprecated
     * @param companyId
     */
    async startTrial(companyId: CompanyServiceTypes.ID) {
        return this.invokeApiWithErrorHandling(`/internal/company/${companyId}/startTrial`, 'PUT');
    }

    /**
     * end trial
     * @deprecated
     * @param companyId
     */
    async endTrial(companyId: CompanyServiceTypes.ID) {
        return this.invokeApiWithErrorHandling(`/internal/company/${companyId}/endTrial`, 'PUT');
    }

    /**
     * @deprecated
     * Gets the details of a company group.
     */
    async fetchGroup(name: string) {
        return this.invokeApiWithErrorHandling<CompanyServiceTypes.CompanyGroup>(`/internal/company/groups/${name}`);
    }
}
