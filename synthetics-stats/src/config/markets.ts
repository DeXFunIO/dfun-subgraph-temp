function createMarketConfig(
  marketToken: string,
  indexToken: string,
  longToken: string,
  shortToken: string
): MarketConfig {
  return new MarketConfig(marketToken, indexToken, longToken, shortToken);
}

export class MarketConfig {
  constructor(
    public marketToken: string,
    public indexToken: string,
    public longToken: string,
    public shortToken: string
  ) {}
}

export let marketConfigs = new Map<string, MarketConfig>();
const USDC = "0x22eBC340e23e85f4F871d69b7f66f902bD7d94f7";
const USDT = "0xa97763a7cDab6E96b04F837174dDe78C34B317Af";
const GAS = "0x1CE16390FD09040486221e912B87551E4e44Ab17";
const ETH = "0x6153135c30342B10Fb34E7c302f63aC106ec2634"
const BTC = "0x7CaC93bb5a759f36Fe20Cc951E3CA6aF93160216"
marketConfigs.set(
  "0xf39042E4EA0EB1a93CBd94C79C2AD226066cD905",
  createMarketConfig(
    "0xf39042E4EA0EB1a93CBd94C79C2AD226066cD905",
    USDC,
    USDC,
    USDT
  )
);

marketConfigs.set(
  "0xA6ebf069fC6B0c0e2B962C7b73170220A4F5213D",
  createMarketConfig(
    "0xA6ebf069fC6B0c0e2B962C7b73170220A4F5213D",
    GAS,
    GAS,
    USDC
  )
);

marketConfigs.set(
  "0x64313Bc9AaCFAcFD24cCE9F03E021Ce69DBa7500",
  createMarketConfig(
    "0x64313Bc9AaCFAcFD24cCE9F03E021Ce69DBa7500",
    GAS,
    GAS,
    USDT
  )
);

marketConfigs.set(
  "0x8784E18586D46fD501b5BDc56253Ac239d7A14e3",
  createMarketConfig(
    "0x8784E18586D46fD501b5BDc56253Ac239d7A14e3",
    ETH,
    ETH,
    USDC
  )
);

marketConfigs.set(
  "0x10aAaf85Cc5B19beBee1B99d73832E4Acbc9DcCE",
  createMarketConfig(
    "0x10aAaf85Cc5B19beBee1B99d73832E4Acbc9DcCE",
    ETH,
    ETH,
    USDT
  )
);

marketConfigs.set(
  "0x6D3593D245e1C3Dc22A27481f9682AeA824eEDd2",
  createMarketConfig(
    "0x6D3593D245e1C3Dc22A27481f9682AeA824eEDd2",
    BTC,
    BTC,
    USDC
  )
);

marketConfigs.set(
  "0xE8edd3e7537b6Caf5337efc91C9DAFe488b5C58b",
  createMarketConfig(
    "0xE8edd3e7537b6Caf5337efc91C9DAFe488b5C58b",
    BTC,
    BTC,
    USDT
  )
);
