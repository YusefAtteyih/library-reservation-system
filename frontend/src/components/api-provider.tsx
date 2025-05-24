import { SWRConfig } from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig 
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval: 5000
      }}
    >
      {children}
    </SWRConfig>
  );
}
