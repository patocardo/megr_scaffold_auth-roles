
type FauxactFunctionComponent<Props extends {}> =
(props: Props, context?: any) => FauxactFunctionComponent<any> | null | JSX.Element;

export default FauxactFunctionComponent;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Reducer
export type ActionType<T> = {
    type: string,
    payload: T
}

export type DispatchType<T> = (action: ActionType<T>) => any;
  