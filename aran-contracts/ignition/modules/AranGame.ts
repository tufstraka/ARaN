import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AranGameModule = buildModule("AranGameModule", (m) => {
  const aranGame = m.contract("AranGame");
  return { aranGame };
});

export default AranGameModule;
