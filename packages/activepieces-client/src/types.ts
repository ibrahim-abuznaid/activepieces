import {
  FlowOperationRequest,
  FlowStatus,
  ListFlowsRequest,
  PieceOptionRequest,
  PopulatedFlow,
  SeekPage,
} from '@activepieces/shared';
import {
  ExecutePropsResult,
  PieceMetadataModel,
  PieceMetadataModelSummary,
  PropertyType,
} from '@activepieces/pieces-framework';

export interface ClientConfig {
  baseUrl: string;
  token: string;
  projectId: string;
  environment?: string;
  userAgent?: string;
  maxRetries?: number;
}

export interface FlowCreateParams {
  displayName: string;
  folderId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface FlowListParams
  extends Partial<Omit<ListFlowsRequest, 'projectId'>> {}

export interface LoadOptionsParams extends PieceOptionRequest {}

export interface LoadOptionsResult<T extends PropertyType>
  extends ExecutePropsResult<T> {}

export interface FlowOperations {
  create(params: FlowCreateParams): Promise<PopulatedFlow>;
  update(
    flowId: string,
    operation: FlowOperationRequest,
  ): Promise<PopulatedFlow>;
  changeStatus(flowId: string, status: FlowStatus): Promise<PopulatedFlow>;
  list(params?: FlowListParams): Promise<SeekPage<PopulatedFlow>>;
  get(flowId: string): Promise<PopulatedFlow>;
}

export interface PieceOperations {
  list(params?: Record<string, unknown>): Promise<PieceMetadataModelSummary[]>;
  get(
    name: string,
    params?: { version?: string; projectId?: string; locale?: string },
  ): Promise<PieceMetadataModel>;
  loadOptions<T extends PropertyType = PropertyType.DROPDOWN>(
    params: LoadOptionsParams,
    propertyType: T,
  ): Promise<LoadOptionsResult<T>>;
}

export interface IFlowBackend {
  readonly flows: FlowOperations;
  readonly pieces: PieceOperations;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly response?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestContext {
  path: string;
  method: string;
  attempt: number;
  status?: number;
}
