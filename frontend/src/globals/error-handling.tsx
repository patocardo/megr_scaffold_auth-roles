import React, { ComponentType, useState } from 'react';
import keyGenerate, { safeParseJSON } from '../utils/string';
import { GraphQLGeneric, ResponseType, GraphQLWithError } from './types';
import BannerAlert from '../components/BannerAlert'; 
import useEffectDeep from '../utils/use-effect-deep';

export type ErrorType = {
  key: string,
  message: string,
  stack?: string,
  /* TODO: evaluate how to return from server and UI:
  loggable: boolean
  public: boolean
   */
}

export function hasErrors(value: any): boolean {
  return (Array.isArray(value) && value.length > 0 && ({}).hasOwnProperty.call(value[0], 'key'));
}

export function mergeErrors(...args: Array<null| ErrorType[] | Error>): null | ErrorType[] {
  const clean = args.filter(elm=> !!elm);
  if (!clean) return null;
  return clean.flat().map(elm => {
    if(elm instanceof Error) return mapJSError(elm);
    return elm;
  });
}
export function parseResponseError(response: ResponseType): Array<ErrorType> | null {
  if (response.status?.toString()[0] === '2') return null;
  return [{
    key: keyGenerate(response.statusText, 10),
    message: response.statusText + ':' + response.url,
  }];
}

export function parseGraphQLError(response: GraphQLGeneric): Array<ErrorType> | null {
  const {errors} = (response as GraphQLWithError);
  if (!errors || !Array.isArray(errors) || !errors.length) return null;
  return errors.map((err) => ({
    key: keyGenerate(err.message, 10),
    message: err.message,
  }));
}
export function mapBackErrors(err: Error): ErrorType[] {
  const parsed = safeParseJSON(err.message, err.message);
  if(Array.isArray(parsed)) return parsed;
  return [mapJSError(err)];
}

export function mapJSError(err: Error): ErrorType {
  return {
    key: keyGenerate(err.message, 10),
    message: err.message,
    stack: err.stack
  }
}

export function logError(err: Error| string | null, info?: object) {
  // TODO: create a service
  console.error(err, info);
}

export default function withErrorBoundary<CallerProps extends {}>(
  CallerComponent: ComponentType<CallerProps>
) {
  type HocProps = {
    // TODO
  };
  type HocState = {
    readonly errors: ErrorType[] | null | undefined;
  };

  return class Hoc extends React.Component<HocProps, HocState> {
    static displayName = `withErrorBoundary(${CallerComponent.name})`;
    static readonly WrappedComponent = CallerComponent;

    readonly state: HocState = {
      errors: [],
    };

    componentDidCatch(err: Error | null, info: object) {
      if (err) {
        this.setState({ errors: [mapJSError(err)] })
        logError(err, info);
      } else {
        new Error('Uncaught error');
      }
    }

    render() {
      const { children, ...restProps } = this.props;
      const { errors } = this.state;

      if (errors && errors.length) {
        return (
          <ul>
            {errors.map(err => <li key={err.key}>{err.message}</li>)}
          </ul>
        );
      }

      return <CallerComponent {...(restProps as CallerProps)} />;
    }
  };
};
type BannerErrorPropsType = {
  errors: Array<null|ErrorType[]|ErrorType| Error>,
  message?: string
};

export function BannerError(props: BannerErrorPropsType) {
  const { errors, message = 'Server Error' } = props;
  const [ showErrors, setShowErrors] = useState<ErrorType[]>([]);

  useEffectDeep(() => {
    const clean = errors.filter(elm=> !!elm);
    if (!clean) {
      setShowErrors([]);
    } else {
      setShowErrors(clean.flat().map(elm => {
        if(elm instanceof Error) return mapJSError(elm);
        return elm;
      }));
    };

  }, [errors]);

  return (
    <BannerAlert
      severity="error"
      isOpen={showErrors.length > 0}
      closeFn={() => setShowErrors([])}
      title={message}
      body={showErrors}
    />
  )
}