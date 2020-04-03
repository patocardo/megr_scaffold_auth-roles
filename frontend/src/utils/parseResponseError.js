import keyGenerate from './string';

export default function parseResponseError(response) {
  if (!({}).hasOwnProperty.call(response, 'errors' || !response.errors.length)) return null;
  return response.errors.map((err) => ({
    key: keyGenerate(err.message, 10),
    message: err.message,
  }));
}
