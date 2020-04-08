import keyGenerate from './string';
import { GraphQLGeneric, GraphQLWithError, GraphQLWithData, ResponseType } from './types';

export function parseResponseError(response: ResponseType) {
  if (response.status.toString()[0] === '2') return null;
  return [{
    key: keyGenerate(response.statusText, 10),
    message: response.statusText + ':' + response.url,
  }];
}

export function parseGraphQLError(response: GraphQLGeneric) {
  if ((response as GraphQLWithData).data) return null;
  const {errors} = (response as GraphQLWithError);
  if (!errors.length) return null;
  return errors.map((err) => ({
    key: keyGenerate(err.message, 10),
    message: err.message,
  }));
}