export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface EqualsCondition {
  key: string;
  value: unknown;
}

export interface InCondition {
  key: string;
  values: unknown[];
}

export interface WhereClause {
  key: string;
  op: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "contains" | "exists";
  value?: unknown;
}

export interface Condition {
  has?: string | string[];
  equals?: EqualsCondition;
  in?: InCondition;
  where?: WhereClause[];
  and?: Condition[];
  or?: Condition[];
  not?: Condition;
}

export interface ConditionalPatch {
  when: Condition;
  set: Record<string, unknown>;
}

export type DynamicNode = {
  optionsIf?: ConditionalPatch[];
  [key: string]: unknown;
};

export interface ResolveOptions {
  preserveRules?: boolean;
}
