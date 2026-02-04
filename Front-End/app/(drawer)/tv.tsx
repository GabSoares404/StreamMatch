import React, { useEffect, useState } from 'react';
import MediaGrid from '../../components/MediaGrid';
import { fetchTrendingTV, UnifiedMedia } from '../../services/api';

import SearchBar from '../../components/SearchBar';

export default function TV() {
    const [data, setData] = useState<UnifiedMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const res = await fetchTrendingTV();
        setData(res);
        setIsLoading(false);
    };

    return <MediaGrid data={data} isLoading={isLoading} title="TV" ListHeaderComponent={<SearchBar searchBarText="Buscar em TV" />} />;
}
