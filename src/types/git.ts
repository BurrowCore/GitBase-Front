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
