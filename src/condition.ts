import { Condition, WhereClause } from "./types.js";

const getByPath = (source: unknown, path: string): unknown => {
  const parts = path.split(".");
  let current: unknown = source;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const idx = Number(part);
      if (Number.isNaN(idx) || idx < 0 || idx >= current.length) {
        return undefined;
      }
      current = current[idx];
      continue;
    }

    if (typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return current;
};

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
};

const primitiveCompare = (op: WhereClause["op"], left: unknown, right: unknown): boolean => {
  switch (op) {
    case "eq":
      return Object.is(left, right);
    case "ne":
      return !Object.is(left, right);
    case "gt":
      return typeof left === "number" && typeof right === "number" && left > right;
    case "gte":
      return typeof left === "number" && typeof right === "number" && left >= right;
    case "lt":
      return typeof left === "number" && typeof right === "number" && left < right;
    case "lte":
      return typeof left === "number" && typeof right === "number" && left <= right;
    case "in":
      return Array.isArray(right) && right.some((item) => Object.is(item, left));
    case "contains":
      if (typeof left === "string" && typeof right === "string") {
        return left.includes(right);
      }
      if (Array.isArray(left)) {
        return left.some((item) => Object.is(item, right));
      }
      return false;
    case "exists":
      return hasMeaningfulValue(left);
    default:
      return false;
  }
};

const evaluateWhere = (where: WhereClause[], context: Record<string, unknown>): boolean => {
  return where.every((clause) => {
    const actual = getByPath(context, clause.key);
    return primitiveCompare(clause.op, actual, clause.value);
  });
};

export const evaluateCondition = (
  condition: Condition,
  context: Record<string, unknown>,
): boolean => {
  const checks: boolean[] = [];

  if (condition.has !== undefined) {
    const keys = Array.isArray(condition.has) ? condition.has : [condition.has];
    checks.push(keys.every((key) => hasMeaningfulValue(getByPath(context, key))));
  }

  if (condition.equals) {
    checks.push(Object.is(getByPath(context, condition.equals.key), condition.equals.value));
  }

  if (condition.in) {
    const candidate = getByPath(context, condition.in.key);
    checks.push(condition.in.values.some((item) => Object.is(item, candidate)));
  }

  if (condition.where) {
    checks.push(evaluateWhere(condition.where, context));
  }

  if (condition.and) {
    checks.push(condition.and.every((entry) => evaluateCondition(entry, context)));
  }

  if (condition.or) {
    checks.push(condition.or.some((entry) => evaluateCondition(entry, context)));
  }

  if (condition.not) {
    checks.push(!evaluateCondition(condition.not, context));
  }

  if (checks.length === 0) {
    return false;
  }

  return checks.every(Boolean);
};
