'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Reply, Download, Megaphone, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

type NoticeAttachment = {
    id: number;
    fileName: string;
    contentType?: string;
};

type NoticeComment = {
    id: number;
    content: string;
    authorUsername: string;
    authorDisplayName: string;
    createdAt: string;
    likeCount: number;
    dislikeCount: number;
    currentUserReaction?: 'LIKE' | 'DISLIKE' | null;
    replies: NoticeComment[];
};

type Notice = {
    id: number;
    categories: string[];
    title: string;
    description: string;
    createdAt: string;
    postedByUsername: string;
    postedByDisplayName: string;
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    currentUserReaction?: 'LIKE' | 'DISLIKE' | null;
    attachments: NoticeAttachment[];
    comments: NoticeComment[];
};

function formatDate(value: string) {
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export function NoticeFeed() {
    const { isAuthenticated } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
    const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
    const [replyOpen, setReplyOpen] = useState<Record<number, boolean>>({});

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const data = isAuthenticated
                ? (await axiosInstance.get('/notices/public')).data
                : await (await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/notices/public', {
                    cache: 'no-store',
                })).json();
            setNotices(Array.isArray(data) ? data : []);
            setError(null);
        } catch {
            setError('Failed to load notices.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [isAuthenticated]);

    useEffect(() => {
        if (notices.length === 0 || typeof window === 'undefined') {
            return;
        }

        notices.forEach((notice) => {
            const key = `notice-viewed-${notice.id}`;
            if (window.sessionStorage.getItem(key)) {
                return;
            }

            window.sessionStorage.setItem(key, 'true');
            fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + `/notices/${notice.id}/view`, {
                method: 'POST',
            }).catch(() => {
                window.sessionStorage.removeItem(key);
            });
        });
    }, [notices]);

    const downloadAttachment = async (attachment: NoticeAttachment) => {
        try {
            const res = await axiosInstance.get(`/notices/attachments/${attachment.id}/download`, {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.fileName;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            setError('Failed to download attachment.');
        }
    };

    const submitComment = async (noticeId: number) => {
        const content = (commentDrafts[noticeId] || '').trim();
        if (!content) return;
        try {
            await axiosInstance.post(`/notices/${noticeId}/comments`, { content });
            setCommentDrafts(prev => ({ ...prev, [noticeId]: '' }));
            await fetchNotices();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to post comment.');
        }
    };

    const submitReply = async (commentId: number) => {
        const content = (replyDrafts[commentId] || '').trim();
        if (!content) return;
        try {
            await axiosInstance.post(`/notices/comments/${commentId}/replies`, { content });
            setReplyDrafts(prev => ({ ...prev, [commentId]: '' }));
            setReplyOpen(prev => ({ ...prev, [commentId]: false }));
            await fetchNotices();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to post reply.');
        }
    };

    const reactToNotice = async (noticeId: number, reactionType: 'LIKE' | 'DISLIKE') => {
        if (!isAuthenticated) return;
        try {
            await axiosInstance.post(`/notices/${noticeId}/reactions`, { reactionType });
            await fetchNotices();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update notice reaction.');
        }
    };

    const reactToComment = async (commentId: number, reactionType: 'LIKE' | 'DISLIKE') => {
        if (!isAuthenticated) return;
        try {
            await axiosInstance.post(`/notices/comments/${commentId}/reactions`, { reactionType });
            await fetchNotices();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update comment reaction.');
        }
    };

    const renderComments = (comments: NoticeComment[], depth = 0) => (
        <div className={`space-y-3 ${depth > 0 ? 'ml-6 border-l border-emerald-100 pl-4' : ''}`}>
            {comments.map(comment => (
                <div key={comment.id} className="rounded-[1.4rem] border border-[var(--line-soft)] bg-[var(--surface-1)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-900">{comment.authorDisplayName || comment.authorUsername}</span>
                        <span className="text-slate-400">@{comment.authorUsername}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">{comment.content}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => reactToComment(comment.id, 'LIKE')}
                            disabled={!isAuthenticated}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                comment.currentUserReaction === 'LIKE'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-white text-slate-600 hover:bg-emerald-50'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            <ThumbsUp className="h-4 w-4" />
                            {comment.likeCount || 0}
                        </button>
                        <button
                            onClick={() => reactToComment(comment.id, 'DISLIKE')}
                            disabled={!isAuthenticated}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                comment.currentUserReaction === 'DISLIKE'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-white text-slate-600 hover:bg-rose-50'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            <ThumbsDown className="h-4 w-4" />
                            {comment.dislikeCount || 0}
                        </button>
                        {isAuthenticated && (
                            <button
                                onClick={() => setReplyOpen(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-700)] hover:text-[var(--brand-800)]"
                            >
                                <Reply className="h-4 w-4" />
                                Reply
                            </button>
                        )}
                    </div>
                    {replyOpen[comment.id] && (
                        <div className="mt-3 space-y-2">
                            <textarea
                                value={replyDrafts[comment.id] || ''}
                                onChange={(e) => setReplyDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                rows={3}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                placeholder="Write a reply..."
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={() => submitReply(comment.id)}
                                    className="rounded-lg bg-[var(--brand-900)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-700)]"
                                >
                                    Post Reply
                                </button>
                            </div>
                        </div>
                    )}
                    {comment.replies.length > 0 && <div className="mt-4">{renderComments(comment.replies, depth + 1)}</div>}
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <section className="border-b border-[var(--line-soft)] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf8_100%)] px-5 py-16 sm:px-8">
                <div className="mx-auto max-w-7xl text-center text-slate-500">Loading notices...</div>
            </section>
        );
    }

    if (notices.length === 0) {
        return null;
    }

    return (
        <section className="border-b border-[var(--line-soft)] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf8_100%)] px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#064e3b_0%,#0f766e_100%)] text-white shadow-lg">
                        <Megaphone className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-700)]">Notice Board</p>
                            <h2 className="text-3xl font-extrabold text-slate-900">Latest Notices</h2>
                        </div>
                    </div>
                </div>

                {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                <div className="space-y-8">
                    {notices.map(notice => (
                        <article key={notice.id} className="overflow-hidden rounded-[2rem] border border-[var(--line-soft)] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
                            <div className="border-b border-[var(--line-soft)] bg-white px-6 py-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    {notice.categories.map((category) => (
                                        <span
                                            key={`${notice.id}-${category}`}
                                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800"
                                        >
                                            {category}
                                        </span>
                                    ))}
                                    <span className="text-sm text-slate-500">Posted by {notice.postedByDisplayName}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-sm text-slate-500">{formatDate(notice.createdAt)}</span>
                                </div>
                                <h3 className="mt-3 text-2xl font-bold text-slate-900">{notice.title}</h3>
                                <p className="mt-4 whitespace-pre-line text-slate-700 leading-7">{notice.description}</p>
                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                                        <Eye className="h-4 w-4" />
                                        {notice.viewCount || 0} views
                                    </div>
                                    <button
                                        onClick={() => reactToNotice(notice.id, 'LIKE')}
                                        disabled={!isAuthenticated}
                                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                                            notice.currentUserReaction === 'LIKE'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        {notice.likeCount || 0}
                                    </button>
                                    <button
                                        onClick={() => reactToNotice(notice.id, 'DISLIKE')}
                                        disabled={!isAuthenticated}
                                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                                            notice.currentUserReaction === 'DISLIKE'
                                                ? 'bg-rose-100 text-rose-700'
                                                : 'bg-slate-100 text-slate-700 hover:bg-rose-50'
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                    >
                                        <ThumbsDown className="h-4 w-4" />
                                        {notice.dislikeCount || 0}
                                    </button>
                                </div>
                            </div>

                            {notice.attachments.length > 0 && (
                                <div className="border-b border-[var(--line-soft)] bg-[var(--surface-1)] px-6 py-4">
                                    <p className="mb-3 text-sm font-semibold text-slate-800">Attachments</p>
                                    <div className="flex flex-wrap gap-3">
                                        {notice.attachments.map(attachment => (
                                            <button
                                                key={attachment.id}
                                                onClick={() => downloadAttachment(attachment)}
                                                disabled={!isAuthenticated}
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <Download className="h-4 w-4" />
                                                {attachment.fileName}
                                            </button>
                                        ))}
                                    </div>
                                    {!isAuthenticated && (
                                        <p className="mt-2 text-xs text-slate-500">Sign in to download notice attachments.</p>
                                    )}
                                </div>
                            )}

                            <div className="bg-white px-6 py-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-slate-500" />
                                    <h4 className="text-lg font-bold text-slate-900">Discussion</h4>
                                </div>

                                {isAuthenticated ? (
                                    <div className="mb-6 space-y-3">
                                        <textarea
                                            value={commentDrafts[notice.id] || ''}
                                            onChange={(e) => setCommentDrafts(prev => ({ ...prev, [notice.id]: e.target.value }))}
                                            rows={3}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                                            placeholder="Share your comment on this notice..."
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => submitComment(notice.id)}
                                                className="rounded-xl bg-[var(--brand-900)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-700)]"
                                            >
                                                Post Comment
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                        Sign in to comment or reply on notices.
                                    </div>
                                )}

                                {notice.comments.length > 0 ? renderComments(notice.comments) : (
                                    <p className="text-sm text-slate-500">No comments yet.</p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
