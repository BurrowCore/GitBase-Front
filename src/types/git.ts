import type { User } from "./auth";

export interface gitRepository {
    id?: string | null;
    name: string | null;
    description: string | null;
    isPublic: boolean | null;
    hasReadme: boolean | null;
    user: User | null;
    updatedAt: Date | null;
    createdAt: Date | null;
}

export interface createRepository {
    repoName?: string;
    isPrivate?: boolean;
    username?: string | null;
    defaultBranch?: string | null;
}

// ─── Response types (mirror backend DTOs / openapi.yaml) ────────────────────

/**
 * A node in a repository's file tree (recursive). Mirrors backend FileTreeNode.
 * NOTE: Jackson serializes the boolean getter `isDirectory()` as `directory`.
 */
export interface FileTreeNode {
    name: string;
    directory: boolean;
    children: FileTreeNode[];
}

/** One repository with its file tree. Mirrors backend RepositoryTreeDto. */
export interface RepositoryTreeDto {
    repoName: string;
    private: boolean;
    root: FileTreeNode | null;
}

/** Repository metadata. Mirrors backend RepositoryInfo. */
export interface RepositoryInfo {
    username: string;
    repoName: string;
    private: boolean;
    lastCommitTime: number; // epoch millis
}

/** `data` payload returned by POST /web/gitbase/create. */
export interface CreateRepositoryData {
    repository: string;
    remoteUrl: string;
    gitCommands: string[];
}

/** Raw content of a single file at a ref. Mirrors backend FileContentDto. */
export interface FileContent {
    path: string;
    ref: string;
    size: number;
    binary: boolean;
    content: string | null; // null when binary
}

/** Compact commit info. Mirrors backend CommitSummaryDto. */
export interface CommitSummary {
    sha: string;
    shortSha: string;
    message: string;
    authorName: string | null;
    authorEmail: string | null;
    date: number; // epoch millis
}

/** One file/dir entry with its last-touching commit. Mirrors backend DirEntryDto. */
export interface DirEntry {
    name: string;
    path: string;
    type: 'dir' | 'file';
    lastCommitMessage: string | null;
    lastCommitSha: string | null;
    lastCommitDate: number; // epoch millis
}

/** GitHub-style directory listing. Mirrors backend DirectoryListingDto. */
export interface DirectoryListing {
    path: string;
    ref: string;
    latestCommit: CommitSummary | null;
    entries: DirEntry[];
}

/** One page of commit history. Mirrors backend CommitPageDto. */
export interface CommitPage {
    ref: string;
    page: number;
    size: number;
    hasNext: boolean;
    commits: CommitSummary[];
}

/** A single file's change within a commit diff. Mirrors backend FileDiffDto. */
export interface FileDiff {
    path: string;
    oldPath: string | null;
    changeType: 'ADD' | 'MODIFY' | 'DELETE' | 'RENAME' | 'COPY';
    additions: number;
    deletions: number;
    binary: boolean;
    patch: string | null; // null when binary
}

/** Full commit metadata + per-file diff. Mirrors backend CommitDetailDto. */
export interface CommitDetail {
    sha: string;
    shortSha: string;
    message: string;       // full message
    authorName: string | null;
    authorEmail: string | null;
    date: number;          // epoch millis
    parents: string[];
    additions: number;
    deletions: number;
    files: FileDiff[];
}
