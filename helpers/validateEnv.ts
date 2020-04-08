import {
  cleanEnv, str, port
} from 'envalid';

export default function validateEnv() {
  cleanEnv(process.env, {
    MONGO_PASSWORD: str(),
    MONGO_DB: str(),
    MONGO_USER: str(),
    PORT: port(),
  });
}