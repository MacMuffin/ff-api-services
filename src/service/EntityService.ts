import { Flowdsl } from '@flowfact/node-flowdsl';
import { Entity, EntityAccess, EntityACLType, EntityDescriptor, EntityFields, EntityView, PagedResponse } from '@flowfact/types';
import { AxiosResponse } from 'axios';
import { APIClient, APIMapping } from '../http';
import { EntityQuery, EntitySchemaQuery, ParamList } from '..';

export interface DeleteEntitiesResponse<T> {
    responses: {
        [entityId: string]: {
            response: T;
            statusCode: number;
        };
    };
}

export type PrefixResponse = {
    prefixes: PrefixData[];
};

export interface PrefixData {
    prefix: string;
    schema: string;
    defaultForSchemas?: string[];
}

export interface TrashedEntity {
    content: Entity;
    schemaName: string;
    entityId: string;
    deletedAt: number;
    deletedBy: string;
}

export interface TrashedEntitiesResponse {
    entries: TrashedEntity[];
    totalCount: number;
    page: number;
    pageSize: number;
    offset: number;
    size: number;
}

export interface TrashedEntitySchemaName {
    schema: string;
}

export interface TrashedEntitiesSchemaNameResponse {
    schemas: TrashedEntitySchemaName[];
}

export interface TrashedEntityIds {
    entityIds: string[];
}

export enum Operation {
    ADD = 'add',
    REMOVE = 'remove',
    REPLACE = 'replace',
}

export class EntityService extends APIClient {
    constructor() {
        super(APIMapping.entityService);
    }

    /**
     * TODO: Please comment this method
     * @param schemaId
     * @param entity
     * @return the created entity id
     */
    async createEntity(schemaId: string, entity: any): Promise<AxiosResponse<any>> {
        return this.invokeApi(`/schemas/${schemaId}`, 'POST', entity || {});
    }

    /**
     * This method creates a new entity and automatically add values of the fields with the same name of the previous
     * schema/entity. The new entity schema can be different as the previous schema.
     * @param schemaName
     *      The schema name of the new entity
     * @param previousSchemaName
     *      The schema name of the previous entity
     * @param previousEntityId
     *      The entity of the previous entity
     * @return the created entity id
     */
    async createEntityFromPrevious(schemaName: string, previousSchemaName: string, previousEntityId: string): Promise<AxiosResponse<any>> {
        return this.invokeApi(`/schemas/${schemaName}/previous`, 'POST', undefined, {
            queryParams: {
                previousSchemaName,
                previousEntityId,
            },
        });
    }

    /**
     * Get a stringified entity by viewId
     * @param schemaId
     * @param entityId
     * @param viewId
     * @deprecated Use useEntityRelationView hook in frontend instead.
     */
    async stringifyEntity(schemaId: string, entityId: string, viewId = 'EntityRelationView'): Promise<AxiosResponse<string | undefined>> {
        return this.invokeApi(`/views/${viewId}/schemas/${schemaId}/entities/${entityId}/stringify`);
    }

    /**
     * Get a stringified entity by type instead of viewId
     * @param schemaName
     * @param entityId
     * @deprecated Use useEntityRelationView hook in frontend instead.
     */
    async stringifyEntityByType(schemaName: string, entityId: string): Promise<AxiosResponse<string | undefined>> {
        return this.invokeApi(`/views/schemas/${schemaName}/entities/${entityId}/stringify`);
    }

    /**
     * TODO: Please comment this method
     * @param index
     * @param viewName
     * @param {Flowdsl} flowdsl
     * @param page
     * @param size
     * @param withCount
     */
    async searchEntity(index: string, viewName: string, flowdsl?: Flowdsl, page = 1, size = 20, withCount?: boolean) {
        const queryParams: ParamList = {
            page,
            size,
            viewName,
            withCount,
        };

        return this.invokeApi<PagedResponse<EntityView>>(`/search/schemas/${index}`, 'POST', flowdsl, {
            queryParams: queryParams,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Searchs for entities and returns the entity merged with the schema and the view
     * @param index
     * @param viewName
     * @param {Flowdsl} flowdsl
     * @param offset
     * @param size
     * @param withCount
     */
    async fetchEntitiesVirtualized(index: string, viewName: string, flowdsl?: Flowdsl, offset = 0, size = 20, withCount?: boolean) {
        const queryParams: ParamList = {
            offset,
            size,
            viewName,
            withCount,
        };

        return this.invokeApi<PagedResponse<EntityView>>(`/search/schemas/${index}`, 'POST', flowdsl, {
            queryParams: queryParams,
        });
    }

    /**
     * Searchs for entities and return the entity merged with the view and not like in v1 with the schema.
     * @param index
     * @param viewName
     * @param {Flowdsl} flowdsl
     * @param offset
     * @param size
     * @param withCount
     */
    async fetchEntitiesVirtualizedV2(index: string, viewName: string, flowdsl?: Flowdsl, offset = 0, size = 20, withCount?: boolean) {
        const queryParams: ParamList = {
            offset,
            size,
            viewName,
            withCount,
        };

        return this.invokeApi<PagedResponse<EntityView>>(`/search/schemas/${index}`, 'POST', flowdsl, {
            queryParams: queryParams,
            headers: {
                'x-ff-version': 2,
            },
        });
    }

    /**
     * Delete a entity in the Backend
     * @param entityId
     * @param schemaId
     */
    async deleteEntity(entityId: string, schemaId: string) {
        return this.invokeApi(`/schemas/${schemaId}/entities/${entityId}`, 'DELETE');
    }

    /**
     * Deletes some entities of a specific schema. The schema can be a group as well.
     * @param data
     */
    async deleteEntities(data: { entities: EntitySchemaQuery[] }) {
        return this.invokeApiWithErrorHandling<DeleteEntitiesResponse<string>>(`/entities`, 'DELETE', data, {
            headers: {
                // The v2 header is important, otherwise a customer could delete his whole system
                'x-ff-version': 2,
            },
        });
    }

    /**
     * Updates an entity in the backend
     * @param schemaId
     * @param entityId
     * @param fields
     */
    async updateEntity(schemaId: string, entityId: string, fields: EntityFields) {
        return this.invokeApi<Entity>(`/schemas/${schemaId}/entities/${entityId}`, 'PATCH', fields);
    }

    /**
     * Updates an entity in the backend with rules defined in the body
     * It is different from the updateEntity method, because the service checks for a field configuration (like hasMultipleValues, maxItems, etc.)
     * For example: if a field is a single value and already has a value, it will be overwritten with a new value.
     * On the other hand, if a field is a multiple value and already has a value, the new value will be appended.
     *
     * @param schemaId
     * @param entityId
     * @param fields
     * @param operation
     */
    async updateEntityDeep(schemaId: string, entityId: string, fields: EntityFields, operation: Operation) {
        return this.invokeApiWithErrorHandling<Entity>(`/schemas/${schemaId}/entities/${entityId}/deep`, 'PATCH', {
            op: operation,
            value: fields,
        });
    }

    /**
     * TODO: Please comment this method
     * @param viewId
     * @param schemaId
     * @param entityId
     */
    async fetchEntityWithViewDefinition(viewId: string, schemaId: string, entityId: string) {
        return this.invokeApi<EntityView>(`/views/${viewId}/schemas/${schemaId}/entities/${entityId}`, 'GET');
    }

    /**
     * TODO: Please comment this method
     * @param schemaId
     * @param entityId
     */
    async fetchEntity(schemaId: string, entityId: string) {
        return this.invokeApi<Entity>(`/schemas/${schemaId}/entities/${entityId}`, 'GET');
    }

    /**
     * fetches the entity detail information just by id
     * @param entityId
     */
    async fetchEntityDescriptor(entityId: string) {
        return this.invokeApi<EntityDescriptor>(`/entities/${entityId}`, 'GET', undefined, {
            headers: {
                Accept: 'application/json+descriptor',
            },
        });
    }

    /**
     * Get the history of a entity in a well formatted form.
     * @param schemaId
     * @param entityId
     * @param page
     * @deprecated Please use the history-service instead.
     */
    async fetchHistory(schemaId: string, entityId: string, page: number): Promise<AxiosResponse<any>> {
        return this.invokeApi(`/schemas/${schemaId}/entities/${entityId}/history?page=${page}&size=15&order=DESC`, 'GET');
    }

    /**
     * Check the right of a user to access a single entity.
     * @param schemaId
     * @param entityId
     * @param userId
     * @param accessType
     */
    async hasAccessForSingleEntity(schemaId: string, entityId: string, userId: string, accessType: EntityACLType): Promise<AxiosResponse<any>> {
        return this.invokeApi(`/schemas/${schemaId}/entities/${entityId}/users/${userId}/hasaccess/${accessType}`, 'GET');
    }

    /**
     * Check the rights of a user to access several entities.
     * @param userId
     * @param accessType
     * @param entities
     */
    async hasAccessForMultipleEntities(userId: string, accessType: EntityACLType, entities: EntityQuery[]) {
        return this.invokeApi<EntityAccess[]>(`/users/${userId}/hasaccess/${accessType}`, 'POST', entities);
    }

    /**
     * This method sends entityIds and schemaIds to the entity-service and the entity-service transform this data
     * into views with the entity. So an array will be returned, with the viewEntity.
     * @param viewName
     * @param entityQueries
     */
    async transformEntitiesWithView(viewName: string, entityQueries: EntityQuery[]) {
        return this.invokeApi<EntityView[]>(`/views/${viewName}/entities`, 'POST', entityQueries);
    }

    /**
     * Duplicates an entity and its multimedia files like images and documents.
     * @param schemaId
     * @param entityId
     * @returns a new UUID of created entity.
     */
    async duplicateEntity(schemaId: string, entityId: string, targetSchema?: string) {
        const queryParams: ParamList = {
            targetSchema,
        };
        return this.invokeApiWithErrorHandling<string>(`/schemas/${schemaId}/entities/${entityId}/duplicate`, 'POST', undefined, { queryParams });
    }

    /**
     * Returns an entity
     * @param entityId
     */
    async fetchEntityWithoutSchemaId(entityId: string) {
        return this.invokeApiWithErrorHandling<Entity>(`/entities/${entityId}`, 'GET');
    }

    /**
     * Fetches the existing prefixes from the server
     */
    async fetchPrefixes() {
        return this.invokeApiWithErrorHandling<PrefixResponse>('/prefixes', 'GET');
    }

    /**
     * Updates the prefix for a schema
     * @param schema The schema name of the schema that gets the prefix assigned
     * @param prefix The prefix to be assigned
     */
    async updatePrefix(schema: string, prefix: string) {
        const postBody = {
            schema,
            prefix,
        };
        return this.invokeApiWithErrorHandling<void>('/prefixes', 'POST', postBody);
    }

    /**
     *
     * returns list of trashed entities
     *
     * @param page
     * @param size
     * @param schemaName
     */

    async fetchTrashedEntities(page: number, size = 50, schema?: string, returnIds?: boolean) {
        return this.invokeApiWithErrorHandling<TrashedEntitiesResponse>('/recovery/entities', 'GET', undefined, {
            queryParams: {
                page,
                size,
                schema,
                returnIds,
            },
        });
    }

    /**
     *
     * delete trashed entities
     *
     * @param toBeDeletedEntities
     */

    async deleteTrashedEntities(toBeDeletedEntities: string[]) {
        return this.invokeApiWithErrorHandling('/recovery/entities', 'DELETE', { entityIds: toBeDeletedEntities });
    }

    /**
     *
     * restores trashed entities
     *
     * @param toBeRestoredEntities
     */

    async restoreTrashedEntities(toBeRestoredEntities: string[]) {
        return this.invokeApiWithErrorHandling('/recovery/entities', 'POST', { entityIds: toBeRestoredEntities });
    }

    /**
     *
     * returns array of schema names of trashed entities
     *
     */
    async fetchTrashedEntitySchemaNames() {
        return this.invokeApiWithErrorHandling<TrashedEntitiesSchemaNameResponse>('/recovery/schemas', 'GET', undefined, undefined);
    }
}

export default new EntityService();
