import { APIClient, APIMapping } from '../../http';
import { EmailServiceTypes } from './EmailService.Types';

export class SendController extends APIClient {
    constructor() {
        super(APIMapping.emailService);
    }

    async sendMail(mail: EmailServiceTypes.Email) {
        const formData = new FormData();
        formData.append('model', JSON.stringify(mail));
        return this.invokeApiWithErrorHandling('/mails/html', 'POST', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    /**
     * Sends a mail using the new draft_email endpoint.
     * @param draftMailEntityId
     *      The id of a entity (schema draft_email)
     * @param sendSearchProfilesLink
     *      Optional parameter to generate search profiles links during email sending
     */
    async sendMailV2(draftMailEntityId: string, sendSearchProfilesLink =  false) {
        return this.invokeApiWithErrorHandling(`/emails/send/${draftMailEntityId}`, 'POST', undefined, {
            headers: {
                'x-ff-version': 2,
            },
            params: {
                sendSearchProfilesLink
            }
        });
    }
}
