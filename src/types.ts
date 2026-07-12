export interface PinchInfo {
  active: boolean;
  sx: number;
  sy: number;
}

export interface GestureData {
  hand1: PinchInfo;
  hand2: PinchInfo;
}
