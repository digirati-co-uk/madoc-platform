import { genSalt, hash } from 'bcrypt';

export async function passwordHash(password: string, rounds = 12): Promise<string> {
  if (rounds < 10 || rounds > 16) {
    throw new Error('Invalid salt');
  }
  const salt = await genSalt(12);
  return hash(password, salt);
}
