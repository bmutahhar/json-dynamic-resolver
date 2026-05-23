import { evaluateCondition } from "./condition.js";
import { ConditionalPatch, ResolveOptions } from "./types.js";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const cloneValue = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as T;
  }

  if (isObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = cloneValue(val);
    }
    return result as T;
  }

  return value;
};

const mergePatch = (base: unknown, patch: unknown): unknown => {
  if (!isObject(base) || !isObject(patch)) {
    return cloneValue(patch);
  }

  const result: Record<string, unknown> = { ...base };

  for (const [key, patchValue] of Object.entries(patch)) {
    const existing = result[key];
    result[key] = mergePatch(existing, patchValue);
  }

  return result;
};

const applyConditionalPatches = (
  node: Record<string, unknown>,
  rules: ConditionalPatch[],
  context: Record<string, unknown>,
): Record<string, unknown> => {
  let current: Record<string, unknown> = node;

  for (const rule of rules) {
    if (evaluateCondition(rule.when, context)) {
      current = mergePatch(current, rule.set) as Record<string, unknown>;
    }
  }

  return current;
};

export const resolveDynamic = <T>(
  input: T,
  context: Record<string, unknown>,
  options: ResolveOptions = {},
): T => {
  if (Array.isArray(input)) {
    return input.map((entry) => resolveDynamic(entry, context, options)) as T;
  }

  if (!isObject(input)) {
    return input;
  }

  const raw = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (key === "optionsIf") {
      continue;
    }
    result[key] = resolveDynamic(value, context, options);
  }

  const rules = raw.optionsIf;
  const applied = Array.isArray(rules)
    ? applyConditionalPatches(result, rules as ConditionalPatch[], context)
    : result;

  if (options.preserveRules && Array.isArray(rules)) {
    applied.optionsIf = cloneValue(rules);
  }

  return applied as T;
};

export const resolveModelConfig = <T>(model: T, formState: Record<string, unknown>): T => {
  return resolveDynamic(model, formState, { preserveRules: true });
};
