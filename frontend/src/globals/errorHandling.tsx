import React, { ComponentType, ReactElement } from 'react';
import keyGenerate from '../utils/string';
import { GraphQLGeneric, ResponseType, GraphQLWithError } from './types';

export interface IError {
  key: string
  message: string
  stack?: string
  /* TODO: evaluate haw to return from server and UI:
  loggable: boolean
  public: boolean
   */
}

export function hasErrors(value: any): boolean {
  return (Array.isArray(value) && value.length > 0 && ({}).hasOwnProperty.call(value[0], 'key'));
}

export function parseResponseError(response: ResponseType): Array<IError> | null {
  if (response.status?.toString()[0] === '2') return null;
  return [{
    key: keyGenerate(response.statusText, 10),
    message: response.statusText + ':' + response.url,
  }];
}

export function parseGraphQLError(response: GraphQLGeneric): Array<IError> | null {
  const {errors} = (response as GraphQLWithError);
  if (!errors || !Array.isArray(errors) || !errors.length) return null;
  return errors.map((err) => ({
    key: keyGenerate(err.message, 10),
    message: err.message,
  }));
}

export function mapJSError(err: Error): IError {
  return {
    key: keyGenerate(err.message, 10),
    message: err.message,
    stack: err.stack
  }
}

export function logError(err: Error| null, info?: object) {
  // TODO: create a service
  console.error(err, info);
}

interface IPropsErrorBoundary {
  children: ReactElement
}

export default function withErrorBoundary<CallerProps extends {}>(
  CallerComponent: ComponentType<CallerProps>
) {
  type HocProps = {
    // pending
  };
  type HocState = {
    readonly errors: IError[] | null | undefined;
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
            {errors.map(err => <li>{err.message}</li>)}
          </ul>
        );
      }

      return <CallerComponent {...(restProps as CallerProps)} />;
    }
  };
};