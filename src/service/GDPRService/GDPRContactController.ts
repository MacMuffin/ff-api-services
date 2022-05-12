import { APIClient, APIMapping } from '../../http';
import { Contact } from '@flowfact/types';

export class GDPRContactController extends APIClient {
    constructor() {
        super(APIMapping.gdprService);
    }

    /**
     * TODO: Please comment this method
     * @param page
     * @param size
     */
    async fetchContactsWithPendingConsent(page = 1, size = 50) {
        return await this.invokeApiWithErrorHandling<Contact[]>('/contacts', 'GET', undefined, {
            queryParams: {
                status: 'CONSENT_PENDING',
                page: page,
                size: size,
            },
        });
    }

    /**
     * TODO: Please comment this method
     * @param contactId
     */
    async isContactBlocked(contactId: string) {
        return await this.invokeApiWithErrorHandling<boolean>('/contact/blocked', 'GET', undefined, {
            queryParams: {
                contactId: contactId,
            },
        });
    }

    /**
     * TODO: Please comment this method
     * @param contactId
     * @param block should the contact be blocked
     */
    async blockContact(contactId: string, block: boolean) {
        return await this.invokeApiWithErrorHandling('/contact/block', 'POST', undefined, {
            headers: {
                'Content-Type': 'application/json',
            },
            queryParams: {
                block: block,
                contactId: contactId,
            },
        });
    }

    /**
     * TODO: Please comment this method
     * @param contactId
     */
    async sendCheckContactDetailsMail(contactId: string) {
        return await this.invokeApiWithErrorHandling(`/contacts/mail/${contactId}`, 'POST');
    }
}
