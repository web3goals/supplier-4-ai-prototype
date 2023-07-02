import { WebKwil, Utils } from "kwil";

import { BrowserProvider } from "ethers";

/**
 * Hook for work with Kwil.
 */
export default function useKwil() {
  const kwil: WebKwil = new WebKwil({
    kwilProvider: "https://provider.kwil.com",
  });
  const dbid: string = Utils.generateDBID(
    process.env.NEXT_PUBLIC_KWIL_DB_OWNER || "",
    process.env.NEXT_PUBLIC_KWIL_DB_NAME || ""
  );

  let selectSupply = async function (id: string) {
    return await kwil.selectQuery(
      dbid,
      `SELECT * FROM supplies WHERE id = '${id}'`
    );
  };

  let selectSupplies = async function () {
    return await kwil.selectQuery(dbid, `SELECT * FROM supplies`);
  };

  let insertSupply = async function (
    id: string,
    tokenContract: string,
    tokenId: string,
    tokenImage: string,
    tokenDescription: string
  ) {
    const provider: BrowserProvider = new BrowserProvider(
      (window as any).ethereum
    );
    const signer = await provider.getSigner();
    const inputs = new Utils.ActionInput()
      .put("$id", id)
      .put("$token_contract", tokenContract)
      .put("$token_id", tokenId)
      .put("$token_image", tokenImage)
      .put("$token_description", tokenDescription);
    const actionTx = await kwil
      .actionBuilder()
      .dbid(dbid)
      .name("insert_supply")
      .concat(inputs)
      .signer(signer)
      .buildTx();
    return await kwil.broadcast(actionTx);
  };

  let deleteSupply = async function (id: string) {
    const provider: BrowserProvider = new BrowserProvider(
      (window as any).ethereum
    );
    const signer = await provider.getSigner();
    const inputs = new Utils.ActionInput().put("$id", id);
    const actionTx = await kwil
      .actionBuilder()
      .dbid(dbid)
      .name("delete_supply")
      .concat(inputs)
      .signer(signer)
      .buildTx();

    return await kwil.broadcast(actionTx);
  };

  return { selectSupply, selectSupplies, insertSupply, deleteSupply };
}
