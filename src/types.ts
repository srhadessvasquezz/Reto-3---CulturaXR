export type GestureCommand =
  | 'NONE'
  | 'TOGGLE_FREEZE'
  | 'SHOW_INFO'
  | 'NEXT_MODEL'
  | 'PREVIOUS_MODEL'
  | 'MENU_TOGGLE'
  | 'TAKE_PHOTO';

export interface PinchInfo {
  active: boolean;
  sx: number;
  sy: number;
}

export interface GestureData {
  command: GestureCommand;
  hand1: PinchInfo;
  hand2: PinchInfo;
  hand1FingersExtended: number;
  hand2FingersExtended: number;
  isFrozen: boolean;
  // ModelViewer lo pone en true tras procesar un comando de flanco (ej.
  // TOGGLE_FREEZE) para que no se re-dispare en frames de React siguientes.
  commandConsumed: boolean;
}
