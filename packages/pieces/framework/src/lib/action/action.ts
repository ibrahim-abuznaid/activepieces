import { z } from 'zod';
import { ActionContext } from '../context';
import { ActionBase } from '../piece-metadata';
import { InputPropertyMap } from '../property';
import { ExtractPieceAuthPropertyTypeForMethods, PieceAuthProperty } from '../property/authentication';

export type ActionRunner<PieceAuth extends PieceAuthProperty | PieceAuthProperty[] | undefined = PieceAuthProperty, ActionProps extends InputPropertyMap = InputPropertyMap> =
  (ctx: ActionContext<PieceAuth, ActionProps>) => Promise<unknown | void>

export const ErrorHandlingOptionsParam = z.object({
  retryOnFailure: z.object({
    defaultValue: z.boolean().optional(),
    hide: z.boolean().optional(),
  }),
  continueOnFailure: z.object({
    defaultValue: z.boolean().optional(),
    hide: z.boolean().optional(),
  }),
})
export type ErrorHandlingOptionsParam = z.infer<typeof ErrorHandlingOptionsParam>

export const ActionAudience = z.enum(['agent', 'canvas', 'both'])
export type ActionAudience = z.infer<typeof ActionAudience>

type CreateActionParams<PieceAuth extends PieceAuthProperty | PieceAuthProperty[] | undefined, ActionProps extends InputPropertyMap> = {
  /**
   * A dummy parameter used to infer {@code PieceAuth} type
   */
  name: string
  /**
   * this parameter is used to infer the type of the piece auth value in run and test methods
   */
  auth?: PieceAuth
  displayName: string
  description: string
  /**
   * Optional alternate description shown to LLMs (chat / MCP).
   * Use this for tool-selection guidance, anti-patterns, disambiguation,
   * and parameter pitfalls that would be noise in the human UI description.
   * Falls back to {@code description} when omitted.
   */
  llmDescription?: string
  /**
   * Who this action is intended for. `agent` = only exposed as an MCP/LLM
   * tool. `canvas` = only shown in the visual flow builder. `both` (default
   * when omitted) = exposed in both surfaces.
   */
  audience?: ActionAudience
  /**
   * Whether re-running this action with the same inputs has the same effect.
   * Used by retry policies, agent planners, and the canvas to surface a "safe
   * to retry" hint. Read-only / GET-style actions should set `true`.
   */
  idempotent?: boolean
  /**
   * Representative successful response shape, used by the agent surface and
   * the canvas test/sample-output pane when no live test data is available.
   */
  sampleData?: unknown
  props: ActionProps
  run: ActionRunner<ExtractPieceAuthPropertyTypeForMethods<PieceAuth>, ActionProps>
  test?: ActionRunner<ExtractPieceAuthPropertyTypeForMethods<PieceAuth>, ActionProps>
  requireAuth?: boolean
  errorHandlingOptions?: ErrorHandlingOptionsParam
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class IAction<PieceAuth extends PieceAuthProperty | PieceAuthProperty[] | undefined = any, ActionProps extends InputPropertyMap = InputPropertyMap> implements ActionBase {
  constructor(
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly props: ActionProps,
    public readonly run: ActionRunner<ExtractPieceAuthPropertyTypeForMethods<PieceAuth>, ActionProps>,
    public readonly test: ActionRunner<ExtractPieceAuthPropertyTypeForMethods<PieceAuth>, ActionProps>,
    public readonly requireAuth: boolean,
    public readonly errorHandlingOptions: ErrorHandlingOptionsParam,
    public readonly llmDescription?: string,
    public readonly audience?: ActionAudience,
    public readonly idempotent?: boolean,
    public readonly sampleData?: unknown,
  ) { }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action<
  PieceAuth extends PieceAuthProperty | PieceAuthProperty[] | undefined = any,
  ActionProps extends InputPropertyMap = any,
> = IAction<PieceAuth, ActionProps>

export const createAction = <
  PieceAuth extends PieceAuthProperty | PieceAuthProperty[] | undefined = PieceAuthProperty,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ActionProps extends InputPropertyMap = any
>(
  params: CreateActionParams<PieceAuth, ActionProps>,
) => {
  return new IAction(
    params.name,
    params.displayName,
    params.description,
    params.props,
    params.run,
    params.test ?? params.run,
    params.requireAuth ?? true,
    params.errorHandlingOptions ?? {
      continueOnFailure: {
        defaultValue: false,
      },
      retryOnFailure: {
        defaultValue: false,
      }
    },
    params.llmDescription,
    params.audience,
    params.idempotent,
    params.sampleData,
  )
}
