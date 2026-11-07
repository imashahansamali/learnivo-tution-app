import { useEffect, useState } from 'react';
import { watch } from '../services/data';

export function useCollection<T>(
  name: string,
  filters: [string, string][] = []
) {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    setLoading(true);
    setError('');

    return watch<T>(
      name,
      JSON.parse(filterKey),
      values => {
        setItems(values);
        setLoading(false);
      },
      message => {
        setError(message);
        setLoading(false);
      }
    );
  }, [name, filterKey]);

  return { items, error, loading };
}