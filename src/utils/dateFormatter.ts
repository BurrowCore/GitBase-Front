/** GitHub-style relative time from an epoch-millis timestamp, e.g. "3 days ago". */
export const formatRelativeTime = (epochMillis?: number): string => {
    if (!epochMillis) return '';
    const diff = Date.now() - epochMillis;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} minute${min > 1 ? 's' : ''} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`;
    const days = Math.floor(hr / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
};

export const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatDateTimeShort = (dateTime?: any) => {
    if (dateTime === null || dateTime === undefined || dateTime === '') return '';

    let d: Date | undefined;

    if (dateTime instanceof Date) {
        d = dateTime;
    } else if (typeof dateTime === 'number') {
        d = new Date(dateTime);
    }
    else if (Array.isArray(dateTime)) {
        // Expecting [year, monthIndexOrNumber, day, hours, minutes, seconds, fractional]
        // Backend may return months as 10 for October; JS Date months are 0-based, so if month > 11 subtract 1
        const arr = dateTime as any[];
        const year = Number(arr[0] ?? 0);
    let month = Number(arr[1] ?? 0);
    // If backend uses 1-12 for months (common), convert to 0-11 for JS Date
    if (month >= 1 && month <= 12) month = month - 1;
        const day = Number(arr[2] ?? 1);
        const hours = Number(arr[3] ?? 0);
        const minutes = Number(arr[4] ?? 0);
        const seconds = Number(arr[5] ?? 0);
        let ms = 0;
        const frac = arr[6];
        if (typeof frac === 'number') {
            // frac could be microseconds or nanoseconds scaled; keep first 3 digits as milliseconds
            const fracStr = String(frac);
            ms = Number(fracStr.substring(0, 3).padEnd(3, '0')) || 0;
        } else if (typeof frac === 'string') {
            const fracStr = frac.replace(/\D/g, '');
            ms = Number(fracStr.substring(0, 3).padEnd(3, '0')) || 0;
        }
        d = new Date(year, month, day, hours, minutes, seconds, ms);
    }
    else if (typeof dateTime === 'string') {
        let s = dateTime.trim();
        s = s.replace(' ', 'T');
        s = s.replace(/(\.\d{3})\d+/, '$1');
        s = s.replace(/\.(\d{1,2})(?!\d)/, (_m: string, p1: string) => '.' + p1.padEnd(3, '0'));
        d = new Date(s);
        if (isNaN(d.getTime())) {
            const noFrac = s.replace(/\.\d+/, '');
            d = new Date(noFrac);
            if (isNaN(d.getTime())) {
                return dateTime;
            }
        }
    }

    if (!d || isNaN(d.getTime())) {
        return '';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${day}/${month}/${year} at ${hours}:${minutes} ${ampm}`;
}
