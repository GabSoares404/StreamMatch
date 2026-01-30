import React, { useEffect, useState } from 'react';
import MediaGrid from '../../components/MediaGrid';
import { fetchTrendingAnime, UnifiedMedia } from '../../services/api';

export default function Animes() {
    const [data, setData] = useState<UnifiedMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const res = await fetchTrendingAnime();
        setData(res);
        setIsLoading(false);
    };

    return <MediaGrid data={data} isLoading={isLoading} title="Animes" />;
}
