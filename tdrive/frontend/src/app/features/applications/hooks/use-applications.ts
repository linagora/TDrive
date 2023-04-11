import { useEffect, useRef, useState } from 'react';
import { Application } from 'app/features/applications/types/application';
import ApplicationsAPIClient from '../api/applications-api-client';
import { replaceOnlyOfficeForCanary } from './temp-fix';

export function useApplications() {
  const [loading, setLoading] = useState<boolean>(true);
  const [applications, setApplications] = useState<Application[]>();

  const handleListRef = useRef(async (searchQuery?: string) => {
    const res = await ApplicationsAPIClient.search(searchQuery);

    res && setApplications(res);
    setLoading(false);
  });

  const search = (searchQuery?: string) => handleListRef.current(searchQuery);

  useEffect(() => {
    handleListRef.current();
  }, []);

  return {
    applications: applications && replaceOnlyOfficeForCanary(applications),
    loading,
    search,
  };
}
