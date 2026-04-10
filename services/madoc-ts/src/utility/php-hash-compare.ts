import bcrypt from 'bcryptjs';

export async function phpHashCompare(input: string, hash: string) {
  return await bcrypt.compare(input, hash.replace(/^\$2y/, '$2a'));
}
