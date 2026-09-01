import { useEffect } from 'react';

/**
 * Sets the document title when the component mounts.
 * @param title - page title (will have " | Teens Aloud" appended)
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Teens Aloud Foundation` : 'Teens Aloud Foundation';
    return () => { document.title = prev; };
  }, [title]);
}
