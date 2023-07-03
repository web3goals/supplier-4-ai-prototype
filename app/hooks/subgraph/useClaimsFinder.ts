import { Claim } from "@/types";
import useError from "hooks/useError";
import { useEffect, useState } from "react";
import { makeSubgraphQuery } from "utils/subgraph";
import { Chain } from "wagmi";

/**
 * Find claims in the subgraph.
 */
export default function useClaimsFinder(args: {
  chain?: Chain;
  supplier?: string;
  first?: number;
  skip?: number;
}): { data: Claim[] | undefined } {
  const { handleError } = useError();
  const [data, setData] = useState<Claim[] | undefined>();

  useEffect(() => {
    // Clear data
    setData(undefined);
    // Prepare query
    const supplierFilter = args.supplier
      ? `supplier: "${args.supplier.toLowerCase()}"`
      : "";
    const filterParams = `where: {${supplierFilter}}`;
    const sortParams = `orderBy: timestamp, orderDirection: desc`;
    const paginationParams = `first: ${args.first || 10}, skip: ${
      args.skip || 0
    }`;
    const query = `{
     claims(${filterParams}, ${sortParams}, ${paginationParams}) {
       id
       supplier
       timestamp
       value
     }
   }`;
    // Make query
    makeSubgraphQuery(args.chain, query)
      .then((response) => {
        setData(
          response.claims?.map((responseClaim: any) => {
            const claim: Claim = {
              id: responseClaim.id,
              supplier: responseClaim.supplier,
              timestamp: responseClaim.timestamp,
              value: responseClaim.value,
            };
            return claim;
          })
        );
      })
      .catch((error) => handleError(error, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.chain, args.supplier, args.first, args.skip]);

  return { data };
}
