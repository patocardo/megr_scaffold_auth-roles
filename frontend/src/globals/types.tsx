
export interface GraphQLWithError {
  errors: {
    message: string;
    locations: {
      line: number;
      column: number;
    }[];
  }[];
  icon: string;
}

export interface GraphQLWithData {
  data: any;
}

export type GraphQLGeneric = GraphQLWithError | GraphQLWithData;

export type ResponseType = {
  type: string;
  url: string;
  redirected: boolean;
  status: number;
  ok: boolean;
  statusText: string
  headers: any;
  body: any;
  bodyUsed: boolean;
}

export type ParsedErrors = {
  key: string,
  message: string
}[]