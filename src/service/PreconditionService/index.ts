import { PortalManagementPreconditionsController } from './PortalManagementPreconditionsController';
import { NylasPreconditionController } from './NylasPreconditionController';
import { InteractiveExposePreconditionsController } from './InteractiveExposePreconditionsController';
import { InquiryPreconditionsController } from './InquiryPreconditionsController';
import { CompanyPreconditionController } from './CompanyPreconditionController';

export * from './PreconditionsService.Types';

export class PreconditionService {
    public readonly portalManagement: PortalManagementPreconditionsController;
    public readonly nylas: NylasPreconditionController;
    public readonly interactiveExpose: InteractiveExposePreconditionsController;
    public readonly inquiry: InquiryPreconditionsController;
    public readonly company: CompanyPreconditionController;

    constructor() {
        this.portalManagement = new PortalManagementPreconditionsController();
        this.nylas = new NylasPreconditionController();
        this.interactiveExpose = new InteractiveExposePreconditionsController();
        this.inquiry = new InquiryPreconditionsController();
        this.company = new CompanyPreconditionController();
    }
}

export const PreconditionsServiceInstance = new PreconditionService();
