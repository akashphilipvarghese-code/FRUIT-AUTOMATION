export type FruitType =
  | "apple"
  | "mango"
  | "orange"
  | "banana"
  | "strawberry"
  | "grape"
  | "auto";

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/** Transaction traceability: origin (seller) and target (buyer) with GPS */
export interface TraceabilityParty {
  name: string;
  location: Location;
}
