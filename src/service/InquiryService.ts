import { AxiosResponse } from 'axios';
import { APIClient, APIMapping, ApiResponse } from '../http';
import { Flowdsl } from '@flowfact/node-flowdsl';
import { PreconditionResponse } from '../util/InternalTypes';

export type InquiryStatus = 'active' | 'pinned' | 'done';

export interface Inquiry {
    id: string;
    iexSendAt: number;
    iexOpenedAt: number;
    contact: string;
    estate: string;
    portalId: string;
    inquiryText: string;
    status: InquiryStatus;
    isSendingIEXAutomaticallyEnabled: true;
    realEstateAgent: string;
    inquiryRecipient: string;
    created: number;
}

export interface InquiryAutomation {
    id: string;
    companyId: string;
    is24ContactApiActive: boolean;
    isActive: boolean;
}

export interface EmailVerificationResult {
    reason: string;
    status: EmailValidationStatus;
}

export enum EmailValidationStatus {
    PROCESSED = 'PROCESSED',
    NOT_INQUIRY = 'NOT_INQUIRY',
    TO_BE_PROCESSED = 'TO_BE_PROCESSED',
}

export class InquiryServiceClass extends APIClient {
    constructor() {
        super(APIMapping.inquiryService);
    }

    /**
     * Fetches all inquiries with pagination support
     * @param {number} page - Number of times the result will be offset by given size.
     * @param {number} size - Number of entities to fetch.
     */
    fetchAll(page: number = 1, size: number = 100): Promise<AxiosResponse<Array<Inquiry>>> {
        return this.invokeApiWithErrorHandling(`/inquiry?page=${page}&size=${size}`, 'GET');
    }

    /**
     * Fetches all inquiries with pagination support
     * @param {Flowdsl} flowDsl - Search what you like.
     * @param {number} page - Number of times the result will be offset by given size.
     * @param {number} size - Number of entities to fetch.
     */
    fetchWithFlowDsl(flowDsl: Flowdsl, page: number = 1, size: number = 100): Promise<AxiosResponse<Array<Inquiry>>> {
        return this.invokeApiWithErrorHandling(`/inquiry?page=${page}&size=${size}`, 'POST', flowDsl);
    }

    /**
     * Use this method to link an estate with given ID to an inquiry with given ID, that has no estate linked yet.
     * @param {string} inquiryId - ID of the inquiry that will be updated.
     * @param {string} estateId - ID of the estate that will be linked to the inquiry.
     * @returns the updated inquiry
     */
    linkEstateAndStartAutomation(inquiryId: string, estateId: string): Promise<AxiosResponse<Inquiry>> {
        return this.invokeApi(`/inquiry/${inquiryId}/setEstate/${estateId}`, 'POST');
    }

    getInquiryAutomation(companyId: string): Promise<AxiosResponse<InquiryAutomation>> {
        return this.invokeApiWithErrorHandling(`/inquiry/automation/${companyId}`, 'GET');
    }

    toggleAutomation(companyId: string): Promise<AxiosResponse<InquiryAutomation>> {
        return this.invokeApiWithErrorHandling(`/inquiry/automation/${companyId}`, 'POST');
    }

    /**
     * Updates the inquiry automation settings
     * @param {string} companyId - ID of the current company
     * @param {InquiryAutomation} settings - new inquiry automation settings
     */
    updateAutomation(companyId: string, settings: InquiryAutomation): Promise<ApiResponse<InquiryAutomation>> {
        return this.invokeApiWithErrorHandling(`/inquiry/automation/${companyId}`, 'PUT', settings);
    }

    /**
     * Trigger the inquiery processing for given email manually.
     * @param entityId as emailId
     */
    replayEmail(entityId: string): Promise<ApiResponse<any>> {
        return this.invokeApiWithErrorHandling(`/email/${entityId}/replay`, 'POST');
    }

    /**
     * Process the email now.
     * @param entityId as emailId
     */
    processEmail(entityId: string): Promise<ApiResponse<any>> {
        return this.invokeApiWithErrorHandling(`/email/${entityId}/process`, 'POST');
    }

    /**
     * Checks if this email is an inquiry and can be processed or is already processed.
     * @param entityId as emailId
     */
    validateEmail(entityId: string): Promise<ApiResponse<any>> {
        return this.invokeApiWithErrorHandling(`/email/${entityId}/verify`, 'GET');
    }

    /**
     * Checks if the Contact API is available for that customer
     */
    checkContactAPIAvailability(): Promise<ApiResponse<PreconditionResponse>> {
        return this.invokeApiWithErrorHandling('/preconditions/authenticatedIs24Portal', 'GET');
    }
}

export const InquiryService = new InquiryServiceClass();
