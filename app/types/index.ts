export type ProfileUriData = {
  name: string;
  image: string;
  attributes: [
    { trait_type: "name"; value: string },
    { trait_type: "about"; value: string },
    { trait_type: "email"; value: string },
    { trait_type: "website"; value: string },
    { trait_type: "twitter"; value: string },
    { trait_type: "telegram"; value: string },
    { trait_type: "instagram"; value: string }
  ];
};

export type Token = {
  contract: string;
  id: string;
  name: string;
  image: string;
};

export type Claim = {
  id: string;
  supplier: string;
  timestamp: number;
  value: string;
};
