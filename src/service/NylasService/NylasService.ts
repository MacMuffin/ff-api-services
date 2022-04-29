import { AccountInfo, AuthRequest, NylasConfig, NylasConfigPatch, RegistrationUrl, SendEmailRequest, SharedAccountsRequest } from '@flowfact/types';
import { AxiosResponse, CancelToken } from 'axios';
import { APIClient, APIMapping, ApiResponse } from '../../http';
import { NylasServiceTypes } from './NylasService.Types';
import SchedulerPage = NylasServiceTypes.SchedulerPage;

/**
 * See https://docs.nylas.com/reference for more info
 */
export class NylasService extends APIClient {
    constructor() {
        super(APIMapping.nylasService);
    }

    /**
     * Authorize a user with the code from the nylas callback
     * @param code
     */
    async authorizeUser(code: string, isGmail: boolean = false): Promise<AxiosResponse<any>> {
        return await this.invokeApi('/account', 'POST', undefined, {
            queryParams: {
                command: 'authorize',
                nativeAuth: false,
                isGmail: isGmail,
                code: code,
            },
        });
    }

    /**
     * Authorize a user with specific credentials
     * @param authRequest IMAP/SMTP credentials
     */
    async nativeAuth(authRequest: AuthRequest): Promise<AxiosResponse<any>> {
        return await this.invokeApi('/account', 'POST', authRequest, {
            queryParams: {
                nativeAuth: true,
                command: 'authorize',
            },
        });
    }

    /**
     * Reactivates a 'cancelled' account and sets it back to 'paid' in nylas
     * @param email the email address to reactivate
     */
    async reactivate(email: string): Promise<AxiosResponse<any>> {
        return await this.invokeApi('/reactivate', 'POST', undefined, {
            queryParams: {
                email: email,
            },
        });
    }

    /**
     * Sends an email using the nylas api
     * @param emailAccount the email to be sending from
     * @param email
     */
    async sendMail(emailAccount: string, email: SendEmailRequest): Promise<ApiResponse<any>> {
        return await this.invokeApiWithErrorHandling('/nylas/send', 'POST', email, {
            queryParams: {
                email: emailAccount,
            },
        });
    }

    /**
     * Returns an attachment metadata using the nylas api
     * @param emailAccount the email to be sending from
     * @param attachmentId
     */
    async fetchAttachmentMetadata(emailAccount: string, attachmentId: string): Promise<ApiResponse<any>> {
        return await this.invokeApiWithErrorHandling(`/nylas/files/${attachmentId}`, 'GET', undefined, {
            queryParams: {
                email: emailAccount,
            },
        });
    }

    /**
     * Uploads an attachment using the nylas api
     * @param emailAccount the email to be sending from
     * @param file attachment
     * @param cancelToken
     */
    async uploadAttachment(emailAccount: string, file: Blob, cancelToken?: CancelToken): Promise<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('file', file);
        return await this.invokeApiWithErrorHandling('/nylas/files', 'POST', formData, {
            queryParams: {
                email: emailAccount,
            },
            cancelToken: cancelToken,
        });
    }

    /**
     * Removes an attachment using the nylas api
     * @param emailAccount the email to be sending from
     * @param attachmentId
     */
    async removeAttachment(emailAccount: string, attachmentId: string): Promise<ApiResponse<any>> {
        return await this.invokeApiWithErrorHandling(`/nylas/files/${attachmentId}`, 'DELETE', undefined, {
            queryParams: {
                email: emailAccount,
            },
        });
    }

    /**
     *
     */
    async fetchConfig(): Promise<AxiosResponse<NylasConfig>> {
        return await this.invokeApi('/config', 'GET');
    }

    /**
     * Generate a url that follows the nylas hosted authorization flow
     * @param email
     * @param callbackUrl URL that has to be confiured
     * @param isGmail
     * @param syncEmails as initial sync value, if set to false or not set, email sync is inactive after creation acc.
     * @param ownerId represents a user as acc. owner. May be different from creator.
     */
    async getRegistrationUrl(
        email: string,
        callbackUrl?: string,
        isGmail: boolean = false,
        syncEmails = false,
        ownerId = undefined
    ): Promise<AxiosResponse<RegistrationUrl>> {
        return await this.invokeApi('/registration-url', 'GET', undefined, {
            queryParams: {
                email: email,
                callbackUrl: callbackUrl,
                isGmail: isGmail,
                initialEmailSyncStatus: syncEmails,
                ownerId: ownerId,
            },
        });
    }

    /**
     * Sets the email account values to the supplied settings, nulls them if they are left out
     * @param config
     */
    async overwriteSettings(config: NylasConfigPatch): Promise<AxiosResponse<any>> {
        return await this.invokeApi('/config', 'POST', config);
    }

    /**
     * Updates the settings to the specified values, keeps existing values if none are supplied
     * @param config
     */
    async updateSettings(config: NylasConfigPatch): Promise<AxiosResponse<any>> {
        return await this.invokeApi('/config', 'PATCH', config);
    }

    /**
     * Sets user default email
     * @param email
     */
    async saveDefaultEmail(email: string) {
        return await this.invokeApiWithErrorHandling<void>('/default-account', 'POST', undefined, {
            queryParams: {
                email: email,
            },
        });
    }

    /**
     * Removes user default email
     */
    async removeDefaultEmail() {
        return await this.invokeApiWithErrorHandling<void>('/default-account', 'DELETE');
    }

    /**
     * TODO: Please comment this method
     */

    /* UNDER DEVELOPMENT; DOES NOT WORK YET */
    async deleteAccount(email: string): Promise<AxiosResponse<any>> {
        return await this.invokeApi('/account', 'DELETE', undefined, {
            queryParams: {
                email: email,
            },
        });
    }

    /**
     * This method returns all information of the given provider.
     * @param mail
     */
    async fetchMailSettings(mail: string): Promise<AxiosResponse<any>> {
        return await this.invokeApi('/mailsettings', 'POST', {
            mail: mail,
        });
    }

    /**
     * This method returns all available calendars for the account
     * @param email
     */
    async fetchCalendars(email: string): Promise<AxiosResponse<any>> {
        return await this.invokeApi('/nylas/calendars', 'GET', undefined, {
            queryParams: {
                email: email,
            },
        });
    }

    /**
     * This method returns all existing Scheduler pages for the specified nylas account
     * @param accountId
     */
    async fetchSchedulerPages(accountId: string) {
        return await this.invokeApi<SchedulerPage[]>(`/schedule/manage/pages?account_id=${accountId}`, 'GET');
    }

    /**
     * This method creates a scheduler page with the given payload. Since this object is really generic there is no good way
     * to map it into an own class therefore it is an object.
     * @param payload
     * @param accountId
     */
    async createSchedulerPage(accountId: string, payload: SchedulerPage) {
        return await this.invokeApi<SchedulerPage>(`/schedule/manage/pages?account_id=${accountId}`, 'POST', payload);
    }

    /**
     * This method enables Delete-Requests for a schedulerpage with the give pageId and accountId
     * @param accountId
     * @param pageId
     */
    async deleteSchedulerPage(accountId: string, pageId: number) {
        return await this.invokeApi<string>(`/schedule/manage/pages/${pageId}?account_id=${accountId}`, 'DELETE');
    }

    /**
     * Gets Nylas account info by email.
     * @param email
     */
    async getAccountInfo(email: string) {
        return await this.invokeApiWithErrorHandling<AccountInfo>('/account-info', 'GET', undefined, {
            queryParams: {
                email: email,
            },
        });
    }

    /**
     * Adds manual account that will be used by the Outlook Add In for manual synchronisation.
     * @param account
     */
    async addManualAccount(account: AccountInfo) {
        return await this.invokeApiWithErrorHandling('/manual-account', 'POST', account);
    }

    /**
     * Creates shared accounts entry for given email account
     * @param sharedAccounts
     */
    async createSharedAccountsList(sharedAccounts: SharedAccountsRequest) {
        return await this.invokeApiWithErrorHandling<void>('/shared-accounts', 'POST', sharedAccounts);
    }

    /**
     * Updates shared accounts list by overwriting all entries
     * @param sharedAccounts
     */
    async updateSharedAccountsList(sharedAccounts: SharedAccountsRequest) {
        return await this.invokeApiWithErrorHandling<void>('/shared-accounts', 'PUT', sharedAccounts);
    }

    /**
     * Deletes all accounts which given email is shared with
     * @param email
     */
    async deleteSharedAccounts(email: string) {
        return await this.invokeApiWithErrorHandling(`/shared-accounts/emails/${email}`, 'DELETE');
    }
}

export default new NylasService();
