import { z } from "zod";

export const syntaxTreeNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export type SyntaxTreeNode = z.infer<typeof syntaxTreeNodeSchema>;

export const syntaxTreeEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export type SyntaxTreeEdge = z.infer<typeof syntaxTreeEdgeSchema>;

export const syntaxTreeSchema = z.object({
  nodes: z.array(syntaxTreeNodeSchema),
  edges: z.array(syntaxTreeEdgeSchema),
});

export type SyntaxTree = z.infer<typeof syntaxTreeSchema>;

export const dfaTransitionSchema = z.object({
  state: z.number(),
  transitions: z.record(z.string(), z.union([z.number(), z.null()])),
});

export type DFATransition = z.infer<typeof dfaTransitionSchema>;

export const dfaSchema = z.object({
  startState: z.number(),
  finalStates: z.array(z.number()),
  alphabet: z.array(z.string()),
  transitions: z.array(dfaTransitionSchema),
});

export type DFA = z.infer<typeof dfaSchema>;

export const nfaTransitionSchema = z.object({
  from: z.number(),
  to: z.number(),
  label: z.string(),
});

export type NFATransition = z.infer<typeof nfaTransitionSchema>;

export const epsilonNFASchema = z.object({
  states: z.array(z.number()),
  startState: z.number(),
  finalStates: z.array(z.number()),
  alphabet: z.array(z.string()),
  transitions: z.array(nfaTransitionSchema),
});

export type EpsilonNFA = z.infer<typeof epsilonNFASchema>;

export const conversionResultSchema = z.object({
  regex: z.string(),
  syntaxTree: syntaxTreeSchema,
  dfa: dfaSchema,
  epsilonNFA: epsilonNFASchema,
  explanation: z.array(z.string()),
});

export type ConversionResult = z.infer<typeof conversionResultSchema>;

export const convertRequestSchema = z.object({
  regex: z.string().min(1, "Regular expression is required"),
});

export type ConvertRequest = z.infer<typeof convertRequestSchema>;

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
