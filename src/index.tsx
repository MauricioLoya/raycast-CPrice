import { ActionPanel, Action, List } from "@raycast/api";
import { useFetch, Response } from "@raycast/utils";
import { useState } from "react";
import { URLSearchParams } from "node:url";
import AssetDetails from "./AssetDetails";
const SEARCH_URL = "https://api.coingecko.com/api/v3/search?";

export default function Command() {
  const [asset, setAsset] = useState<SearchResult>();
  const [searchText, setSearchText] = useState("");
  const { data, isLoading } = useFetch(
    SEARCH_URL +
      // send the search query to the API
      new URLSearchParams({ query: searchText.length === 0 ? "@raycast/api" : searchText }),
    {
      parseResponse: parseFetchResponse,
    },
  );

  if (asset) {
    return <AssetDetails onClear={() => setAsset(undefined)} asset={asset} />;
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search crypto address..."
      throttle
    >
      <List.Section title="Results" subtitle={data?.length + ""}>
        {data?.map((searchResult: SearchResult) => (
          <SearchListItem onSelect={setAsset} key={searchResult.name} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({
  searchResult,
  onSelect,
}: {
  searchResult: SearchResult;
  onSelect: (searchResult: SearchResult) => void;
}) {
  return (
    <List.Item
      title={searchResult.name}
      subtitle={searchResult.api_symbol}
      accessories={[{ text: searchResult.symbol }]}
      icon={{ source: searchResult.thumb }}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action title="Copy Name" onAction={() => onSelect(searchResult)} />
          </ActionPanel.Section>
          {/* <ActionPanel.Section> */}
          {/* <Action.OpenInBrowser title="Open in Browser" url={searchResult.large} /> */}
          {/* </ActionPanel.Section> */}
        </ActionPanel>
      }
    />
  );
}

/** Parse the response from the fetch query into something we can display */
async function parseFetchResponse(response: Response) {
  const json = await response.json();

  if (!response.ok) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return json.coins.map((result: SearchResult) => {
    return {
      id: result.id,
      name: result.name,
      api_symbol: result.api_symbol,
      symbol: result.symbol,
      market_cap_rank: result.market_cap_rank,
      thumb: result.thumb,
      large: result.large,
    };
  });
}

export interface SearchResult {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}
