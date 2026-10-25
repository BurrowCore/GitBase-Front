/**
 * Issue-tracker types. Curated mirrors of the backend DTOs — see `backend/docs/openapi.yaml`.
 *
 * Note: issue numbers come from the SAME per-repository sequence as pull requests, so a repo
 * reads #1, #2, #3 whatever the type. A bare "#12" is therefore unambiguous.
 */
import type { UserSummary } from './pullRequest';

export type IssueState = 'OPEN' | 'CLOSED';

/** Filter accepted by the list endpoint. */
export type IssueFilter = IssueState | 'ALL';

export interface Label {
    name: string;
    /** 6-digit hex, no leading '#'. */
    color: string;
    description: string | null;
}

export interface Issue {
    number: number;
    title: string;
    body: string | null;
    state: IssueState;
    author: UserSummary;
    labels: Label[];
    assignees: UserSummary[];
    commentsCount: number;
    closedBy: UserSummary | null;
    /** Pull request whose merge closed this issue via a closing keyword ("Fixes #N"). */
    closedByPullNumber: number | null;
    createdAt: number | null; // epoch millis
    updatedAt: number | null;
    closedAt: number | null;
}

export interface IssueSummary {
    number: number;
    title: string;
    state: IssueState;
    author: UserSummary;
    labels: Label[];
    assignees: UserSummary[];
    commentsCount: number;
    createdAt: number | null;
    updatedAt: number | null;
}

export interface IssuePage {
    issues: IssueSummary[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    openCount: number;
    closedCount: number;
}

export interface CreateIssuePayload {
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
}

/** Omit a field to leave it unchanged; send an empty array to clear labels/assignees. */
export interface UpdateIssuePayload {
    title?: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
}

/** Compact issue reference, used by dependency lists. */
export interface IssueRef {
    number: number;
    title: string;
    state: IssueState;
}

export interface IssueRefPage {
    issues: IssueRef[];
    page: number;
    size: number;
    totalElements: number;
    hasNext: boolean;
}

/** A Markdown issue template read live from the default branch. */
export interface IssueTemplate {
    fileName: string;
    name: string;
    about: string;
    /** Title prefill — may intentionally end with a space, e.g. "[bug] ". */
    title: string;
    labels: string[];
    assignees: string[];
    body: string;
}

export interface IssueTemplates {
    templates: IssueTemplate[];
    blankIssuesEnabled: boolean;
    /** Always http(s) — validated server-side. */
    contactLinks: { name: string; url: string; about: string }[];
    /** Template files that could not be used; shown to maintainers, never fatal. */
    errors: { fileName: string; message: string }[];
}

export interface CreateLabelPayload {
    name: string;
    color?: string;
    description?: string;
}
