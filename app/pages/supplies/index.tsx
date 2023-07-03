import EntityList from "@/components/entity/EntityList";
import Layout from "@/components/layout";
import { CardBox, MediumLoadingButton } from "@/components/styled";
import SupplyMakeDialog from "@/components/supply/SupplyMakeDialog";
import SupplyRevokeDialog from "@/components/supply/SupplyRevokeDialog";
import { DialogContext } from "@/context/dialog";
import { dataSupplierContractAbi } from "@/contracts/abi/dataSupplierContract";
import useError from "@/hooks/useError";
import useKwil from "@/hooks/useKwil";
import { Token } from "@/types";
import {
  chainToSupportedChainDataSupplierContractAddress,
  chainToSupportedChainId,
} from "@/utils/chains";
import { ipfsUriToHttpUri } from "@/utils/converters";
import { Box, Chip, Typography } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useAccount, useContractRead, useNetwork } from "wagmi";

/**
 * Page with supplies.
 */
export default function Supplies() {
  const { address: accountAddress } = useAccount();
  const { handleError } = useError();
  const [tokenContracts, setTokenContracts] = useState<string[] | undefined>();
  const [tokens, setTokens] = useState<Token[] | undefined>();

  /**
   * Define fake address for testing
   */
  const address =
    accountAddress === "0x4306D7a79265D2cb85Db0c5a55ea5F4f6F73C4B1"
      ? "0x3c8c98ad8062c611afd4d415b43bb98e4e7534bf"
      : accountAddress;

  /**
   * Load token contracts
   */
  useEffect(() => {
    setTokenContracts(undefined);
    if (address) {
      axios
        .get("/api/getAccountNfts", {
          params: {
            address: address,
            network: "polygon",
          },
        })
        .then(({ data }) => {
          setTokenContracts(
            data.data.list
              .filter((element: any) => element.primaryInterface == "erc_721")
              .map((element: any) => element.contract)
          );
        })
        .catch((error) => {
          handleError(error, true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  /**
   * Load tokens
   */
  useEffect(() => {
    setTokens(undefined);
    if (address && tokenContracts) {
      axios
        .get(`https://deep-index.moralis.io/api/v2/${address}/nft`, {
          params: {
            chain: "polygon",
            format: "decimal",
            token_addresses: tokenContracts,
          },
          headers: {
            "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_API_KEY,
          },
        })
        .then(({ data }) => {
          const tokens: Token[] = [];
          for (const token of data.result) {
            const tokenMetadata = JSON.parse(token.metadata);
            if (tokenMetadata?.name && tokenMetadata?.image) {
              tokens.push({
                contract: token.token_address,
                id: token.token_id,
                name: tokenMetadata.name,
                image: tokenMetadata.image,
              });
            }
          }
          setTokens(tokens);
        })
        .catch((error) => {
          handleError(error, true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, tokenContracts]);

  return (
    <Layout maxWidth="sm">
      <Typography variant="h4" textAlign="center" fontWeight={700}>
        ✨ Tokens
      </Typography>
      <Typography textAlign="center" mt={1}>
        on Polygon network that can be supplied to AI for learning
      </Typography>
      <EntityList
        entities={tokens}
        renderEntityCard={(token, index) => (
          <TokenCard token={token} key={index} />
        )}
        noEntitiesText="😐 no tokens"
        sx={{ mt: 2 }}
      />
    </Layout>
  );
}

function TokenCard(props: { token: Token }) {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { selectSupply } = useKwil();
  const [description, setDescription] = useState<string | undefined>();

  /**
   * Contract states
   */
  const { data: isSupplied, refetch: refetchIsSupplied } = useContractRead({
    address: chainToSupportedChainDataSupplierContractAddress(chain),
    abi: dataSupplierContractAbi,
    functionName: "isSupplied",
    args: [props.token.contract as `0x${string}`, BigInt(props.token.id)],
    chainId: chainToSupportedChainId(chain),
  });

  /**
   * Define description
   */
  useEffect(() => {
    setDescription("");
    if (isSupplied) {
      selectSupply(`${props.token.contract}_${props.token.id}`)
        .then(({ data }: any) => setDescription(data?.[0]?.token_description))
        .catch((error) => {
          handleError(error, true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupplied]);

  if (props.token.image.includes("mp4")) {
    return <></>;
  }

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row" }}>
      {/* Left part */}
      <Box width="50%">
        <Image
          src={
            props.token.image.includes("ipfs://")
              ? ipfsUriToHttpUri(props.token.image)
              : props.token.image
          }
          alt="Token"
          width="100"
          height="100"
          sizes="100vw"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
          }}
        />
      </Box>
      {/* Right part */}
      <Box width={1} ml={3} display="flex" flexDirection="column">
        <Typography fontWeight={700}>{props.token.name}</Typography>
        {description && (
          <>
            <Box mt={1}>
              <Chip size="small" label="🖼️ Images" />
            </Box>
            <Typography variant="body2" mt={1} fontStyle="italic">
              {description}
            </Typography>
          </>
        )}
        <Box mt={2}>
          {isSupplied ? (
            <MediumLoadingButton
              variant="outlined"
              onClick={() =>
                showDialog?.(
                  <SupplyRevokeDialog
                    token={props.token}
                    onSuccess={() => refetchIsSupplied()}
                    onClose={closeDialog}
                  />
                )
              }
            >
              ❌ Revoke
            </MediumLoadingButton>
          ) : (
            <MediumLoadingButton
              variant="contained"
              onClick={() =>
                showDialog?.(
                  <SupplyMakeDialog
                    token={props.token}
                    onSuccess={() => refetchIsSupplied()}
                    onClose={closeDialog}
                  />
                )
              }
            >
              🚚 Supply
            </MediumLoadingButton>
          )}
        </Box>
      </Box>
    </CardBox>
  );
}
