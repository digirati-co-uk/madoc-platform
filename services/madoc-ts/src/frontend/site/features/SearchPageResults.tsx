import {SearchResults, TotalResults} from "../../shared/components/SearchResults";
import {Pagination} from "../../shared/components/Pagination";
import React from "react";
import {useTranslation} from "react-i18next";
import {InternationalString} from "@iiif/presentation-3";

interface SearchPageResultsProps {
results?: {},
page?: number,
isLoading: boolean,
    latestData: {},
    rawQuery: {},
    ft: {}
}

export const SearchPageResults: React.FC<SearchPageResultsProps> = ({ results, page, isLoading, latestData, rawQuery,ft  }) => {

    const { t } = useTranslation();

    return (
        <>
<TotalResults>
    {t('Found {{count}} results', {
        count: results && results.pagination ? results.pagination.totalResults : 0,
    })}
</TotalResults>
)}
<Pagination
    page={page}
    totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
    stale={isLoading}
    extraQuery={rawQuery}
/>
<SearchResults
    isFetching={isLoading}
    value={ft}
    searchResults={results ? results.results : []}
/>
<Pagination
    page={page}
    totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
    stale={isLoading}
    extraQuery={rawQuery}
/>
            </>
)}