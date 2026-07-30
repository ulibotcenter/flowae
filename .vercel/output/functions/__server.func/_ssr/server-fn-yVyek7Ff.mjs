import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-B9Q6ahO-.mjs";
import { n as createSsrRpc } from "./createSsrRpc-_1pjCroF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-fn-yVyek7Ff.js
var getExtractStatusFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("561a5f79b607985070e782c7591116d014da2c95a45e1ced7e4ec0b61db2f265"));
var extractConceptFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("ed784e5864a007de5c9ab19434a9517ddb7fbb653a4310eee5c4cf1f6a1d478c"));
/** Public status for Config UI (no full key). */
var getHarveyStatusFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("22043478ae92c45a834ddbd031382a522dc49b13d8a37c67cda87c949abd8e86"));
var saveHarveyApiKeyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("30a1c7af74e7f3cc1da1659eeff548ff88d806ac33f59c5903a85e98ff84bf79"));
var deleteHarveyApiKeyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("68475eddc80014473b1a0a55ae4ff6f82c90d052b485d9a05bdb8bc097d980bb"));
var updateHarveyBaseUrlFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("e7f8d4b892b7deb62794395f842240cdb761b68f35b9f05365ec6843bb474f55"));
var testHarveyConnectionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("bcd2db5234a6e52499312e968143e5eef093597672bca99e8cfc8c2cccddccd2"));
//#endregion
export { saveHarveyApiKeyFn as a, getHarveyStatusFn as i, extractConceptFn as n, testHarveyConnectionFn as o, getExtractStatusFn as r, updateHarveyBaseUrlFn as s, deleteHarveyApiKeyFn as t };
