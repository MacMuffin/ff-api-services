import HttpClient, {APIMapping} from '../http';

export default class TemplateService {

    static client = new HttpClient(APIMapping.templateService);

    static getAllTemplates() {
        return this.client.makeRequestSimple({}, '/templates', 'GET').then(s => s.data).then(s => s ? s : []);
    }

    static getTemplatesByType(type) {
        return this.client.makeRequestSimple({}, `/templates?templateType=${type}`, 'GET').then(s => s.data).then(s => s ? s : []);
    }

    static createTemplate(body) {
        return this.client.makeRequestSimple(body, '/templates', 'POST').then(s => s.data);
    }

    static uploadContent(id, file) {
        const formData = new FormData();
        formData.append('file', file, file.name);

        return this.client.makeRequest({}, `/templates/${id}/content`, 'POST', formData)
    }

    static getTemplateById(id) {
        return this.client.makeRequestSimple({}, `/templates/${id}`, 'GET').then(s => s.data);
    }

    static delete(id) {
        return this.client.makeRequestSimple({}, `/templates/${id}`, 'DELETE').then(s => s.data);
    }

    static updateTemplate(body, id) {
        return this.client.makeRequestSimple(body, `/templates/${id}`, 'PUT').then(s => s.data);
    }
}
