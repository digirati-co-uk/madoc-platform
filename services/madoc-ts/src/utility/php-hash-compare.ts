import { compare } from 'bcrypt';

export async function phpHashCompare(input: string, hash: string) {
  return await compare(input, hash.replace(/^\$2y/, '$2a'));
}
