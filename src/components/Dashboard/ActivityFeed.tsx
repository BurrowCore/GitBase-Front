import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../features/store';
import { fetchRecentActivities } from '../../features/activity/activitySlice';
import { formatDateTimeShort } from '../../utils/dateFormatter';

export const ActivityFeed: React.FC = () => {
    const dispatch = useAppDispatch();
    const activityState = useAppSelector((s) => s.activity);
    const items = activityState?.items ?? [];
    const loading = activityState?.loading ?? false;
    const error = activityState?.error ?? null;

    useEffect(() => {
        dispatch(fetchRecentActivities());
    }, [dispatch]);

    const findTimestampInObject = (obj: any): any | null => {
        if (!obj || typeof obj !== 'object') return null;
        const timestampRegex = /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?/;
        const stack = [obj];
        while (stack.length) {
            const current = stack.pop();
            if (!current || typeof current !== 'object') continue;
            for (const key of Object.keys(current)) {
                const val = current[key];
                if (typeof val === 'string' && timestampRegex.test(val)) return val;
                if (Array.isArray(val)) {
                    const allNumbers = val.every((x: any) => typeof x === 'number');
                    if (allNumbers && val.length >= 6) return val;
                }
                if (typeof val === 'object') stack.push(val);
            }
        }
        return null;
    };

    return (
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-gitbase-border-light/10 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-gitbase-gradient-start via-gitbase-gradient-mid to-gitbase-gradient-end text-transparent bg-clip-text flex items-center">
                <svg className="w-5 h-5 mr-2 text-gitbase-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Activity
            </h3>

            {loading && <div className="text-sm text-gitbase-text-secondary">Loading...</div>}
            {error && <div className="text-sm text-red-400">{String(error)}</div>}

            <div className="space-y-4">
                {items.length === 0 && !loading && (
                    <div className="text-sm text-gitbase-text-secondary">No recent activity</div>
                )}

                {items.map((act) => {
                    const renderIcon = (type?: string) => {
                        const baseClass = 'p-2 rounded-lg group-hover:opacity-90 relative flex-shrink-0';
                        switch (type) {
                            case 'TOKEN_CREATED':
                                return (
                                    <div className="p-2 bg-gitbase-primary/10 rounded-lg text-gitbase-primary group-hover:bg-gitbase-primary/20">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                                );
                            case 'REPO_CREATED':
                                return (
                                    <div className="p-2 bg-gitbase-primary/10 rounded-lg text-gitbase-primary group-hover:bg-gitbase-primary/20">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                                );
                            default:
                                return (
                                    <div className={baseClass + ' bg-gitbase-primary/10 text-gitbase-primary'}>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                );
                        }
                    };

                    const primaryText = act.description || (act.type === 'TOKEN_CREATED' ? `Token created for ${act.target || 'resource'}` : act.type === 'REPO_CREATED' ? `Repository created: ${act.target || ''}` : act.type);

                    const rawTs = (act as any).timestamp || (act as any).createdAt || (act as any).time || (act as any).date || (act as any).ts || findTimestampInObject(act) || null;
                    return (
                        <div key={act.id} className="flex items-center justify-between py-3 border-b border-gitbase-border group">
                            <div className="flex items-center space-x-3">
                                {renderIcon(act.type)}
                                <div>
                                    <p className="text-gitbase-text-primary font-medium">{primaryText}</p>
                                    <p className="text-gitbase-text-secondary text-sm" title={rawTs || ''}>{formatDateTimeShort(rawTs) || 'Unknown date'}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gitbase-text-secondary">{act.actor}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
