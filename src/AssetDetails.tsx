import { Action, ActionPanel, Detail } from "@raycast/api";
import { SearchResult } from ".";
import { useFetch } from "@raycast/utils";

const PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?";

function formatAsMoney(number: number): string {
  const roundedNumber = Number(number.toFixed(2));
  const formattedNumber = roundedNumber.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
  return formattedNumber;
}

interface Props {
  asset: SearchResult;
  onClear: () => void;
}
type Price = Record<string, Record<"usd" | "cad" | "mxn", number>>;
export default function AssetDetails(props: Props) {
  const { data, isLoading } = useFetch<Price>(
    PRICE_URL +
      // send the search query to the API
      new URLSearchParams({ ids: props.asset.id, vs_currencies: "usd,cad,mxn" }),
  );

  if (!data) {
    return <Detail isLoading={true} />;
  }
  console.log(data);

  return (
    <Detail
      isLoading={isLoading}
      markdown={`![](${props?.asset.large})`}
      navigationTitle={props?.asset.name + `(${props.asset.symbol})`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Name" text={props?.asset.name} />
          <Detail.Metadata.Label title="Symbol" text={props?.asset.symbol} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="USD" text={formatAsMoney(data[props.asset.id].usd)} />
          <Detail.Metadata.Label title="CAD" text={formatAsMoney(data[props.asset.id].cad)} />
          <Detail.Metadata.Label title="MX" text={formatAsMoney(data[props.asset.id].mxn)} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Link
            title="Open in Browser"
            target={`https://www.coingecko.com/en/coins/${props.asset.api_symbol}`}
            text={props.asset.name}
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action title="Search" onAction={props.onClear} />
          <Action.CopyToClipboard
            content={
              `USD: ${formatAsMoney(data[props.asset.id].usd)}\n` +
              `CAD: ${formatAsMoney(data[props.asset.id].cad)}\n` +
              `MXN: ${formatAsMoney(data[props.asset.id].mxn)}`
            }
            title="Copy Prices"
          />
          <Action.OpenInBrowser title="Download Large Icon" url={props.asset.large} />
          <Action.OpenInBrowser title="Download Small Icon" url={props.asset.thumb} />
        </ActionPanel>
      }
    />
  );
}
