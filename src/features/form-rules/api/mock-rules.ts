/**
 * Mock data standing in for `GET /forms/:formId/rules`.
 * Shaped exactly like the server DTO so swapping in a real fetch is a one-line
 * change inside the hook — no component touches this file directly.
 */
import type { Rule, RuleId, FormId, FieldId } from "../types/rules";

const id = <T extends string>(v: string) => v as unknown as T;
const formId = id<FormId>("form_hardware_request");

const actor = (name: string) => ({ id: name.toLowerCase(), name });

export const MOCK_RULES: Rule[] = [
  {
    id: id<RuleId>("rule_1"),
    formId,
    order: 1,
    status: "ENABLED",
    conflictCount: 2,
    updatedAt: "2026-06-03T12:04:00Z",
    updatedBy: actor("Priya"),
    trigger: { type: "ON_FIELD_CHANGE", fieldId: id<FieldId>("f_category"), fieldLabel: "Category" },
    scope: { kind: "ALL" },
    advanced: { reverseOnFalse: false, enforceSystemWide: false },
    blocks: [
      {
        id: "b1",
        condition: {
          logic: "AND",
          conditions: [
            {
              id: "c1",
              fieldId: id<FieldId>("f_category"),
              fieldLabel: "Category",
              operator: "EQUALS",
              value: "Hardware",
            },
          ],
        },
        actions: [
          { id: "a1", type: "SHOW", targetFieldId: id<FieldId>("f_asset_tag"), targetFieldLabel: "Asset Tag" },
          { id: "a2", type: "REQUIRE", targetFieldId: id<FieldId>("f_asset_tag"), targetFieldLabel: "Asset Tag" },
        ],
      },
    ],
  },
  {
    id: id<RuleId>("rule_2"),
    formId,
    order: 2,
    status: "ENABLED",
    conflictCount: 0,
    updatedAt: "2026-06-02T09:30:00Z",
    updatedBy: actor("Marco"),
    trigger: { type: "ON_LOAD" },
    scope: { kind: "ALL" },
    advanced: { reverseOnFalse: false, enforceSystemWide: false },
    blocks: [
      {
        id: "b1",
        condition: { logic: "AND", conditions: [] },
        actions: [
          { id: "a1", type: "HIDE", targetFieldId: id<FieldId>("f_approver_notes"), targetFieldLabel: "Approver Notes" },
        ],
      },
    ],
  },
  {
    id: id<RuleId>("rule_3"),
    formId,
    order: 3,
    status: "DISABLED",
    conflictCount: 0,
    updatedAt: "2026-05-28T16:45:00Z",
    updatedBy: actor("Priya"),
    trigger: { type: "ON_SUBMIT" },
    scope: { kind: "ROLES", roleIds: ["requester"] },
    advanced: { reverseOnFalse: false, enforceSystemWide: false },
    blocks: [
      {
        id: "b1",
        condition: {
          logic: "AND",
          conditions: [
            {
              id: "c1",
              fieldId: id<FieldId>("f_cost"),
              fieldLabel: "Cost",
              operator: "GREATER_THAN",
              value: 5000,
            },
          ],
        },
        actions: [
          { id: "a1", type: "REQUIRE", targetFieldId: id<FieldId>("f_manager"), targetFieldLabel: "Manager Approval" },
        ],
      },
    ],
  },
  {
    id: id<RuleId>("rule_4"),
    formId,
    order: 4,
    status: "ENABLED",
    conflictCount: 2,
    updatedAt: "2026-05-20T11:10:00Z",
    updatedBy: actor("Marco"),
    trigger: { type: "ON_LOAD" },
    scope: { kind: "ALL" },
    advanced: { reverseOnFalse: false, enforceSystemWide: false },
    blocks: [
      {
        id: "b1",
        condition: { logic: "AND", conditions: [] },
        actions: [
          { id: "a1", type: "HIDE", targetFieldId: id<FieldId>("f_asset_tag"), targetFieldLabel: "Asset Tag" },
        ],
      },
    ],
  },
];
