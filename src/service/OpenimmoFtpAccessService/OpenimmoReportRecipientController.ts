import { APIClient, APIMapping } from '../../http';
import { OpenImmoReportRecipientTypes } from './OpenimmoReportRecipientService.Types';
type OpenimmoReportRecipient = OpenImmoReportRecipientTypes.OpenimmoReportRecipient;

export default class OpenimmoReportRecipientsController extends APIClient {
    constructor() {
        super(APIMapping.openimmoFtpAccessService);
    }

    /**
     * get all global alert recipients
     */
    async fetchAll() {
        return await this.invokeApiWithErrorHandling<{ recipients: OpenimmoReportRecipient[] }>('/report', 'GET');
    }

    /**
     * update all alert recipients
     * @param recipients
     */
    async updateReportRecipients(recipients: OpenimmoReportRecipient[]) {
        return await this.invokeApiWithErrorHandling<{ recipients: OpenimmoReportRecipient[] }>(`/report`, 'PUT', { recipients });
    }
}
