import React, { useEffect, useState } from 'react';
import MediaGrid from '../../components/MediaGrid';
import { fetchTrendingSeries, UnifiedMedia } from '../../services/api';

import SearchBar from '../../components/SearchBar';

export default function Series() {
    const [data, setData] = useState<UnifiedMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const res = await fetchTrendingSeries();
        setData(res);
        setIsLoading(false);
    };

    return <MediaGrid data={data} isLoading={isLoading} title="Séries" ListHeaderComponent={<SearchBar searchBarText="Buscar série" />} />;
}
